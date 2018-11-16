/**
 * Datatables functions
 * @type {{update_order: Datatables.update_order}}
 */
var Datatables = {

    /**
     * Method for updating the order of the datatable elements through ajax.
     * @param postUrl
     * @param succesMessage - for toastr
     * @param successTitle - for toastr
     * @param ErrorMessage - for toastr
     * @param ErrorTitle - for toastr
     */
    update_order: function(postUrl, succesMessage, successTitle, ErrorMessage, ErrorTitle) {
        $(".update_order").click(function(){
            var ids   = $("[name^=list_ids]");
            var order = $("[name^=order]");
            var idsArr = [];
            var ordersArr = [];
            var c = 0;
            $(ids).each(function(){
                var id = $(this).val();
                var order = $($("[name^=order]")[c]).val();
                idsArr.push(id);
                ordersArr.push(order);
                c++;
            });

            $.post(postUrl,
                { action: 'order', ids: idsArr, order: ordersArr})
                .done(function(data){
                    if(data)
                    {
                        showToast(succesMessage, successTitle, 'success');
                        $('table').DataTable().ajax.reload();
                    }
                }).fail(function() {
                showToast(ErrorMessage, ErrorTitle, 'error');
            });
        });
    }
};

/**
 * Object for creating an interactive map:
 * Requirements in html:
 *      * Text input with #location ID
 *      * div with #map id
 *      * Inputs with names longitude and latitude for showing the details to user
 *      * Including google maps script: https://maps.googleapis.com/maps/api/js?libraries=places&key= {your key}
 */
var InteractiveMap = {
    init: function(latitude, longitude) {

        var map = new google.maps.Map(document.getElementById('map'), {
            center: (latitude && longitude) ? {lat: latitude, lng: longitude} : {lat: 32.06453749470133, lng: 34.76966857910156},
            zoom: (latitude && longitude) ? 17 : 13,
            mapTypeId: 'roadmap'
        });

        var markers = [];

        // Create the search box and link it to the UI element.
        var input = document.getElementById('location');
        var searchBox = new google.maps.places.SearchBox(input);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        // Bias the SearchBox results towards current map's viewport.
        map.addListener('bounds_changed', function() {
            searchBox.setBounds(map.getBounds());
        });

        if(latitude && longitude) {
            var latlng = new google.maps.LatLng(latitude, longitude);
            // Create a marker for each place.
            markers.push(new google.maps.Marker({
                position: latlng
            }));
            markers.forEach(function(marker) {
                marker.setMap(map);
            });
        }

        // Listen for the event fired when the user click the map
        map.addListener('click', function(event) {

            // Clear out the old markers.
            markers.forEach(function(marker) {
                marker.setMap(null);
            });
            markers = [];

            // Create a marker for each place.
            markers.push(new google.maps.Marker({
                position: event.latLng
            }));

            $('input[name="latitude"]').val(event.latLng.lat());
            $('input[name="longitude"]').val(event.latLng.lng());

            markers.forEach(function(marker) {
                marker.setMap(map);
            });
        });

        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place.
        searchBox.addListener('places_changed', function() {
            var places = searchBox.getPlaces();

            if (places.length == 0) {
                return;
            }

            // Clear out the old markers.
            markers.forEach(function(marker) {
                marker.setMap(null);
            });
            markers = [];

            // For each place, get the icon, name and location.
            var bounds = new google.maps.LatLngBounds();
            places.forEach(function(place) {
                if (!place.geometry) {
                    console.log("Returned place contains no geometry");
                    return;
                }
                var icon = {
                    url: place.icon,
                    size: new google.maps.Size(71, 71),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(17, 34),
                    scaledSize: new google.maps.Size(25, 25)
                };

                // Create a marker for each place.
                markers.push(new google.maps.Marker({
                    map: map,
                    icon: icon,
                    title: place.name,
                    position: place.geometry.location
                }));

                $('input[name="latitude"]').val(place.geometry.location.lat());
                $('input[name="longitude"]').val(place.geometry.location.lng());

                if (place.geometry.viewport) {
                    // Only geocodes have viewport.
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(place.geometry.location);
                }
            });
            map.fitBounds(bounds);
        });

        // Disabling enter button for location search box
        $('#location').keypress(function(e) {
            if ( e.which == 13 ) e.preventDefault();
        });
    }
};

$.ajax({
    url: 'https://api.github.com/emojis',
    async: false
}).then(function(data) {
    window.emojis = Object.keys(data);
    window.emojiUrls = data;
});

$("#summernote_1").summernote({
    height:300,
    lang: 'he-IL',
    toolbar: [
        // [groupName, [list of button]]
        ['style', ['bold', 'italic', 'clear']],
        ['codeview', ['codeview']],
        ['link', ['link']],
    ],
    hint: {
        match: /:([\-+\w]+)$/,
        search: function (keyword, callback) {
            callback($.grep(emojiList, function (item) {
                return item.name.toLowerCase().indexOf(keyword.toLowerCase())  !== -1;
            }));
        },
        template: function (item) {
            return '<span style="font-size: 30px">' + item.emoji + '</span> ' + str_limit(item.name);
        },
        content: function (item) {
            if(item.id) {
                var strArray = customParse(item.id);
                var str = '';
                $(strArray).each(function(index, item) {
                    str +=  String.fromCodePoint(item)
                });
                return str;
            }
            return '';
        }
    }
});

function customParse(str) {
    var items = [];
    if(str.indexOf('-') !== -1) {
        $(str.split('-')).each(function(index, item) {
            items.push(parseInt(item, 16));
        });
    } else {
        items.push(parseInt(str, 16));
    }
    return items;
}

function createMultiSelect(selector) {
    $(selector).each(function() {
        $(this).multiSelect({
            selectableOptgroup: true
        });
    });
}


createMultiSelect('.multi-select');


function str_limit(str, length, replace) {
    if(typeof replace == 'undefined') {
        replace = '...';
    }
    if(typeof length == 'undefined') {
        length = 30;
    }

    var replaceLength = replace.toString().length;
    return str.length > length ? str.substring(0, length - replaceLength) + replace : str;
}

var emojiList = [
    {
        "id": "1f601",
        "emoji": "😁",
        "name": "GRINNING FACE WITH SMILING EYES"
    },
    {
        "id": "1f602",
        "emoji": "😂",
        "name": "FACE WITH TEARS OF JOY"
    },
    {
        "id": "1f603",
        "emoji": "😃",
        "name": "SMILING FACE WITH OPEN MOUTH"
    },
    {
        "id": "1f604",
        "emoji": "😄",
        "name": "SMILING FACE WITH OPEN MOUTH AND SMILING EYES"
    },
    {
        "id": "1f605",
        "emoji": "😅",
        "name": "SMILING FACE WITH OPEN MOUTH AND COLD SWEAT"
    },
    {
        "id": "1f606",
        "emoji": "😆",
        "name": "SMILING FACE WITH OPEN MOUTH AND TIGHTLY-CLOSED EYES"
    },
    {
        "id": "1f609",
        "emoji": "😉",
        "name": "WINKING FACE"
    },
    {
        "id": "1f60a",
        "emoji": "😊",
        "name": "SMILING FACE WITH SMILING EYES"
    },
    {
        "id": "1f60b",
        "emoji": "😋",
        "name": "FACE SAVOURING DELICIOUS FOOD"
    },
    {
        "id": "1f60c",
        "emoji": "😌",
        "name": "RELIEVED FACE"
    },
    {
        "id": "1f60d",
        "emoji": "😍",
        "name": "SMILING FACE WITH HEART-SHAPED EYES"
    },
    {
        "id": "1f60f",
        "emoji": "😏",
        "name": "SMIRKING FACE"
    },
    {
        "id": "1f612",
        "emoji": "😒",
        "name": "UNAMUSED FACE"
    },
    {
        "id": "1f613",
        "emoji": "😓",
        "name": "FACE WITH COLD SWEAT"
    },
    {
        "id": "1f614",
        "emoji": "😔",
        "name": "PENSIVE FACE"
    },
    {
        "id": "1f616",
        "emoji": "😖",
        "name": "CONFOUNDED FACE"
    },
    {
        "id": "1f618",
        "emoji": "😘",
        "name": "FACE THROWING A KISS"
    },
    {
        "id": "1f61a",
        "emoji": "😚",
        "name": "KISSING FACE WITH CLOSED EYES"
    },
    {
        "id": "1f61c",
        "emoji": "😜",
        "name": "FACE WITH STUCK-OUT TONGUE AND WINKING EYE"
    },
    {
        "id": "1f61d",
        "emoji": "😝",
        "name": "FACE WITH STUCK-OUT TONGUE AND TIGHTLY-CLOSED EYES"
    },
    {
        "id": "1f61e",
        "emoji": "😞",
        "name": "DISAPPOINTED FACE"
    },
    {
        "id": "1f620",
        "emoji": "😠",
        "name": "ANGRY FACE"
    },
    {
        "id": "1f621",
        "emoji": "😡",
        "name": "POUTING FACE"
    },
    {
        "id": "1f622",
        "emoji": "😢",
        "name": "CRYING FACE"
    },
    {
        "id": "1f623",
        "emoji": "😣",
        "name": "PERSEVERING FACE"
    },
    {
        "id": "1f624",
        "emoji": "😤",
        "name": "FACE WITH LOOK OF TRIUMPH"
    },
    {
        "id": "1f625",
        "emoji": "😥",
        "name": "DISAPPOINTED BUT RELIEVED FACE"
    },
    {
        "id": "1f628",
        "emoji": "😨",
        "name": "FEARFUL FACE"
    },
    {
        "id": "1f629",
        "emoji": "😩",
        "name": "WEARY FACE"
    },
    {
        "id": "1f62a",
        "emoji": "😪",
        "name": "SLEEPY FACE"
    },
    {
        "id": "1f62b",
        "emoji": "😫",
        "name": "TIRED FACE"
    },
    {
        "id": "1f62d",
        "emoji": "😭",
        "name": "LOUDLY CRYING FACE"
    },
    {
        "id": "1f630",
        "emoji": "😰",
        "name": "FACE WITH OPEN MOUTH AND COLD SWEAT"
    },
    {
        "id": "1f631",
        "emoji": "😱",
        "name": "FACE SCREAMING IN FEAR"
    },
    {
        "id": "1f632",
        "emoji": "😲",
        "name": "ASTONISHED FACE"
    },
    {
        "id": "1f633",
        "emoji": "😳",
        "name": "FLUSHED FACE"
    },
    {
        "id": "1f635",
        "emoji": "😵",
        "name": "DIZZY FACE"
    },
    {
        "id": "1f637",
        "emoji": "😷",
        "name": "FACE WITH MEDICAL MASK"
    },
    {
        "id": "1f638",
        "emoji": "😸",
        "name": "GRINNING CAT FACE WITH SMILING EYES"
    },
    {
        "id": "1f639",
        "emoji": "😹",
        "name": "CAT FACE WITH TEARS OF JOY"
    },
    {
        "id": "1f63a",
        "emoji": "😺",
        "name": "SMILING CAT FACE WITH OPEN MOUTH"
    },
    {
        "id": "1f63b",
        "emoji": "😻",
        "name": "SMILING CAT FACE WITH HEART-SHAPED EYES"
    },
    {
        "id": "1f63c",
        "emoji": "😼",
        "name": "CAT FACE WITH WRY SMILE"
    },
    {
        "id": "1f63d",
        "emoji": "😽",
        "name": "KISSING CAT FACE WITH CLOSED EYES"
    },
    {
        "id": "1f63e",
        "emoji": "😾",
        "name": "POUTING CAT FACE"
    },
    {
        "id": "1f63f",
        "emoji": "😿",
        "name": "CRYING CAT FACE"
    },
    {
        "id": "1f640",
        "emoji": "🙀",
        "name": "WEARY CAT FACE"
    },
    {
        "id": "1f645",
        "emoji": "🙅",
        "name": "FACE WITH NO GOOD GESTURE"
    },
    {
        "id": "1f646",
        "emoji": "🙆",
        "name": "FACE WITH OK GESTURE"
    },
    {
        "id": "1f647",
        "emoji": "🙇",
        "name": "PERSON BOWING DEEPLY"
    },
    {
        "id": "1f648",
        "emoji": "🙈",
        "name": "SEE-NO-EVIL MONKEY"
    },
    {
        "id": "1f649",
        "emoji": "🙉",
        "name": "HEAR-NO-EVIL MONKEY"
    },
    {
        "id": "1f64a",
        "emoji": "🙊",
        "name": "SPEAK-NO-EVIL MONKEY"
    },
    {
        "id": "1f64b",
        "emoji": "🙋",
        "name": "HAPPY PERSON RAISING ONE HAND"
    },
    {
        "id": "1f64c",
        "emoji": "🙌",
        "name": "PERSON RAISING BOTH HANDS IN CELEBRATION"
    },
    {
        "id": "1f64d",
        "emoji": "🙍",
        "name": "PERSON FROWNING"
    },
    {
        "id": "1f64e",
        "emoji": "🙎",
        "name": "PERSON WITH POUTING FACE"
    },
    {
        "id": "1f64f",
        "emoji": "🙏",
        "name": "PERSON WITH FOLDED HANDS"
    },
    {
        "emoji": "",
        "name": ""
    },
    {
        "id": "2702",
        "emoji": "✂",
        "name": "BLACK SCISSORS"
    },
    {
        "id": "2705",
        "emoji": "✅",
        "name": "WHITE HEAVY CHECK MARK"
    },
    {
        "id": "2708",
        "emoji": "✈",
        "name": "AIRPLANE"
    },
    {
        "id": "2709",
        "emoji": "✉",
        "name": "ENVELOPE"
    },
    {
        "id": "270a",
        "emoji": "✊",
        "name": "RAISED FIST"
    },
    {
        "id": "270b",
        "emoji": "✋",
        "name": "RAISED HAND"
    },
    {
        "id": "270c",
        "emoji": "✌",
        "name": "VICTORY HAND"
    },
    {
        "id": "270f",
        "emoji": "✏",
        "name": "PENCIL"
    },
    {
        "id": "2712",
        "emoji": "✒",
        "name": "BLACK NIB"
    },
    {
        "id": "2714",
        "emoji": "✔",
        "name": "HEAVY CHECK MARK"
    },
    {
        "id": "2716",
        "emoji": "✖",
        "name": "HEAVY MULTIPLICATION X"
    },
    {
        "id": "2728",
        "emoji": "✨",
        "name": "SPARKLES"
    },
    {
        "id": "2733",
        "emoji": "✳",
        "name": "EIGHT SPOKED ASTERISK"
    },
    {
        "id": "2734",
        "emoji": "✴",
        "name": "EIGHT POINTED BLACK STAR"
    },
    {
        "id": "2744",
        "emoji": "❄",
        "name": "SNOWFLAKE"
    },
    {
        "id": "2747",
        "emoji": "❇",
        "name": "SPARKLE"
    },
    {
        "id": "274c",
        "emoji": "❌",
        "name": "CROSS MARK"
    },
    {
        "id": "274e",
        "emoji": "❎",
        "name": "NEGATIVE SQUARED CROSS MARK"
    },
    {
        "id": "2753",
        "emoji": "❓",
        "name": "BLACK QUESTION MARK ORNAMENT"
    },
    {
        "id": "2754",
        "emoji": "❔",
        "name": "WHITE QUESTION MARK ORNAMENT"
    },
    {
        "id": "2755",
        "emoji": "❕",
        "name": "WHITE EXCLAMATION MARK ORNAMENT"
    },
    {
        "id": "2757",
        "emoji": "❗",
        "name": "HEAVY EXCLAMATION MARK SYMBOL"
    },
    {
        "id": "2764",
        "emoji": "❤",
        "name": "HEAVY BLACK HEART"
    },
    {
        "id": "2795",
        "emoji": "➕",
        "name": "HEAVY PLUS SIGN"
    },
    {
        "id": "2796",
        "emoji": "➖",
        "name": "HEAVY MINUS SIGN"
    },
    {
        "id": "2797",
        "emoji": "➗",
        "name": "HEAVY DIVISION SIGN"
    },
    {
        "id": "27a1",
        "emoji": "➡",
        "name": "BLACK RIGHTWARDS ARROW"
    },
    {
        "id": "27b0",
        "emoji": "➰",
        "name": "CURLY LOOP"
    },
    {
        "emoji": "",
        "name": ""
    },
    {
        "id": "1f680",
        "emoji": "🚀",
        "name": "ROCKET"
    },
    {
        "id": "1f683",
        "emoji": "🚃",
        "name": "RAILWAY CAR"
    },
    {
        "id": "1f684",
        "emoji": "🚄",
        "name": "HIGH-SPEED TRAIN"
    },
    {
        "id": "1f685",
        "emoji": "🚅",
        "name": "HIGH-SPEED TRAIN WITH BULLET NOSE"
    },
    {
        "id": "1f687",
        "emoji": "🚇",
        "name": "METRO"
    },
    {
        "id": "1f689",
        "emoji": "🚉",
        "name": "STATION"
    },
    {
        "id": "1f68c",
        "emoji": "🚌",
        "name": "BUS"
    },
    {
        "id": "1f68f",
        "emoji": "🚏",
        "name": "BUS STOP"
    },
    {
        "id": "1f691",
        "emoji": "🚑",
        "name": "AMBULANCE"
    },
    {
        "id": "1f692",
        "emoji": "🚒",
        "name": "FIRE ENGINE"
    },
    {
        "id": "1f693",
        "emoji": "🚓",
        "name": "POLICE CAR"
    },
    {
        "id": "1f695",
        "emoji": "🚕",
        "name": "TAXI"
    },
    {
        "id": "1f697",
        "emoji": "🚗",
        "name": "AUTOMOBILE"
    },
    {
        "id": "1f699",
        "emoji": "🚙",
        "name": "RECREATIONAL VEHICLE"
    },
    {
        "id": "1f69a",
        "emoji": "🚚",
        "name": "DELIVERY TRUCK"
    },
    {
        "id": "1f6a2",
        "emoji": "🚢",
        "name": "SHIP"
    },
    {
        "id": "1f6a4",
        "emoji": "🚤",
        "name": "SPEEDBOAT"
    },
    {
        "id": "1f6a5",
        "emoji": "🚥",
        "name": "HORIZONTAL TRAFFIC LIGHT"
    },
    {
        "id": "1f6a7",
        "emoji": "🚧",
        "name": "CONSTRUCTION SIGN"
    },
    {
        "id": "1f6a8",
        "emoji": "🚨",
        "name": "POLICE CARS REVOLVING LIGHT"
    },
    {
        "id": "1f6a9",
        "emoji": "🚩",
        "name": "TRIANGULAR FLAG ON POST"
    },
    {
        "id": "1f6aa",
        "emoji": "🚪",
        "name": "DOOR"
    },
    {
        "id": "1f6ab",
        "emoji": "🚫",
        "name": "NO ENTRY SIGN"
    },
    {
        "id": "1f6ac",
        "emoji": "🚬",
        "name": "SMOKING SYMBOL"
    },
    {
        "id": "1f6ad",
        "emoji": "🚭",
        "name": "NO SMOKING SYMBOL"
    },
    {
        "id": "1f6b2",
        "emoji": "🚲",
        "name": "BICYCLE"
    },
    {
        "id": "1f6b6",
        "emoji": "🚶",
        "name": "PEDESTRIAN"
    },
    {
        "id": "1f6b9",
        "emoji": "🚹",
        "name": "MENS SYMBOL"
    },
    {
        "id": "1f6ba",
        "emoji": "🚺",
        "name": "WOMENS SYMBOL"
    },
    {
        "id": "1f6bb",
        "emoji": "🚻",
        "name": "RESTROOM"
    },
    {
        "id": "1f6bc",
        "emoji": "🚼",
        "name": "BABY SYMBOL"
    },
    {
        "id": "1f6bd",
        "emoji": "🚽",
        "name": "TOILET"
    },
    {
        "id": "1f6be",
        "emoji": "🚾",
        "name": "WATER CLOSET"
    },
    {
        "id": "1f6c0",
        "emoji": "🛀",
        "name": "BATH"
    },
    {
        "emoji": "",
        "name": ""
    },
    {
        "id": "24c2",
        "emoji": "Ⓜ",
        "name": "CIRCLED LATIN CAPITAL LETTER M"
    },
    {
        "id": "1f170",
        "emoji": "🅰",
        "name": "NEGATIVE SQUARED LATIN CAPITAL LETTER A"
    },
    {
        "id": "1f171",
        "emoji": "🅱",
        "name": "NEGATIVE SQUARED LATIN CAPITAL LETTER B"
    },
    {
        "id": "1f17e",
        "emoji": "🅾",
        "name": "NEGATIVE SQUARED LATIN CAPITAL LETTER O"
    },
    {
        "id": "1f17f",
        "emoji": "🅿",
        "name": "NEGATIVE SQUARED LATIN CAPITAL LETTER P"
    },
    {
        "id": "1f18e",
        "emoji": "🆎",
        "name": "NEGATIVE SQUARED AB"
    },
    {
        "id": "1f191",
        "emoji": "🆑",
        "name": "SQUARED CL"
    },
    {
        "id": "1f192",
        "emoji": "🆒",
        "name": "SQUARED COOL"
    },
    {
        "id": "1f193",
        "emoji": "🆓",
        "name": "SQUARED FREE"
    },
    {
        "id": "1f194",
        "emoji": "🆔",
        "name": "SQUARED ID"
    },
    {
        "id": "1f195",
        "emoji": "🆕",
        "name": "SQUARED NEW"
    },
    {
        "id": "1f196",
        "emoji": "🆖",
        "name": "SQUARED NG"
    },
    {
        "id": "1f197",
        "emoji": "🆗",
        "name": "SQUARED OK"
    },
    {
        "id": "1f198",
        "emoji": "🆘",
        "name": "SQUARED SOS"
    },
    {
        "id": "1f199",
        "emoji": "🆙",
        "name": "SQUARED UP WITH EXCLAMATION MARK"
    },
    {
        "id": "1f19a",
        "emoji": "🆚",
        "name": "SQUARED VS"
    },
    {
        "id": "1f1e9-1f1ea",
        "emoji": "🇩🇪",
        "name": "REGIONAL INDICATOR SYMBOL LETTER D + REGIONAL INDICATOR SYMBOL LETTER E"
    },
    {
        "id": "1f1ec-1f1e7",
        "emoji": "🇬🇧",
        "name": "REGIONAL INDICATOR SYMBOL LETTER G + REGIONAL INDICATOR SYMBOL LETTER B"
    },
    {
        "id": "1f1e8-1f1f3",
        "emoji": "🇨🇳",
        "name": "REGIONAL INDICATOR SYMBOL LETTER C + REGIONAL INDICATOR SYMBOL LETTER N"
    },
    {
        "id": "1f1ef-1f1f5",
        "emoji": "🇯🇵",
        "name": "REGIONAL INDICATOR SYMBOL LETTER J + REGIONAL INDICATOR SYMBOL LETTER P"
    },
    {
        "id": "1f1f0-1f1f7",
        "emoji": "🇰🇷",
        "name": "REGIONAL INDICATOR SYMBOL LETTER K + REGIONAL INDICATOR SYMBOL LETTER R"
    },
    {
        "id": "1f1eb-1f1f7",
        "emoji": "🇫🇷",
        "name": "REGIONAL INDICATOR SYMBOL LETTER F + REGIONAL INDICATOR SYMBOL LETTER R"
    },
    {
        "id": "1f1ea-1f1f8",
        "emoji": "🇪🇸",
        "name": "REGIONAL INDICATOR SYMBOL LETTER E + REGIONAL INDICATOR SYMBOL LETTER S"
    },
    {
        "id": "1f1ee-1f1f9",
        "emoji": "🇮🇹",
        "name": "REGIONAL INDICATOR SYMBOL LETTER I + REGIONAL INDICATOR SYMBOL LETTER T"
    },
    {
        "id": "1f1fa-1f1f8",
        "emoji": "🇺🇸",
        "name": "REGIONAL INDICATOR SYMBOL LETTER U + REGIONAL INDICATOR SYMBOL LETTER S"
    },
    {
        "id": "1f1f7-1f1fa",
        "emoji": "🇷🇺",
        "name": "REGIONAL INDICATOR SYMBOL LETTER R + REGIONAL INDICATOR SYMBOL LETTER U"
    },
    {
        "id": "1f201",
        "emoji": "🈁",
        "name": "SQUARED KATAKANA KOKO"
    },
    {
        "id": "1f202",
        "emoji": "🈂",
        "name": "SQUARED KATAKANA SA"
    },
    {
        "id": "1f21a",
        "emoji": "🈚",
        "name": "SQUARED CJK UNIFIED IDEOGRAPH-7121"
    },
    {
        "id": "1f22f",
        "emoji": "🈯",
        "name": "SQUARED CJK UNIFIED IDEOGRAPH-6307"
    },
    {
        "id": "1f232",
        "emoji": "🈲",
        "name": "SQUARED CJK UNIFIED IDEOGRAPH-7981"
    },
    {
        "id": "1f233",
        "emoji": "🈳",
        "name": "SQUARED CJK UNIFIED IDEOGRAPH-7A7A"
    },
    {
        "id": "1f234",
        "emoji": "🈴",
        "name": "SQUARED CJK UNIFIED IDEOGRAPH-5408"
    },
    {
        "id": "1f235",
        "emoji": "🈵",
        "name": "SQUARED CJK UNIFIED IDEOGRAPH-6E80"
    },
    {
        "id": "1f236",
        "emoji": "🈶",
        "name": "SQUARED CJK UNIFIED IDEOGRAPH-6709"
    },
    {
        "id": "1f237",
        "emoji": "🈷",
        "name": "SQUARED CJK UNIFIED IDEOGRAPH-6708"
    },
    {
        "id": "1f238",
        "emoji": "🈸",
        "name": "SQUARED CJK UNIFIED IDEOGRAPH-7533"
    },
    {
        "id": "1f239",
        "emoji": "🈹",
        "name": "SQUARED CJK UNIFIED IDEOGRAPH-5272"
    },
    {
        "id": "1f23a",
        "emoji": "🈺",
        "name": "SQUARED CJK UNIFIED IDEOGRAPH-55B6"
    },
    {
        "id": "1f250",
        "emoji": "🉐",
        "name": "CIRCLED IDEOGRAPH ADVANTAGE"
    },
    {
        "id": "1f251",
        "emoji": "🉑",
        "name": "CIRCLED IDEOGRAPH ACCEPT"
    },
    {
        "emoji": "",
        "name": ""
    },
    {
        "id": "00a9",
        "emoji": "©",
        "name": "COPYRIGHT SIGN"
    },
    {
        "id": "00ae",
        "emoji": "®",
        "name": "REGISTERED SIGN"
    },
    {
        "id": "203c",
        "emoji": "‼",
        "name": "DOUBLE EXCLAMATION MARK"
    },
    {
        "id": "2049",
        "emoji": "⁉",
        "name": "EXCLAMATION QUESTION MARK"
    },
    {
        "id": "0038-20e3",
        "emoji": "8⃣",
        "name": "DIGIT EIGHT + COMBINING ENCLOSING KEYCAP"
    },
    {
        "id": "0039-20e3",
        "emoji": "9⃣",
        "name": "DIGIT NINE + COMBINING ENCLOSING KEYCAP"
    },
    {
        "id": "0037-20e3",
        "emoji": "7⃣",
        "name": "DIGIT SEVEN + COMBINING ENCLOSING KEYCAP"
    },
    {
        "id": "0036-20e3",
        "emoji": "6⃣",
        "name": "DIGIT SIX + COMBINING ENCLOSING KEYCAP"
    },
    {
        "id": "0031-20e3",
        "emoji": "1⃣",
        "name": "DIGIT ONE + COMBINING ENCLOSING KEYCAP"
    },
    {
        "id": "0030-20e3",
        "emoji": "0⃣",
        "name": "DIGIT ZERO + COMBINING ENCLOSING KEYCAP"
    },
    {
        "id": "0032-20e3",
        "emoji": "2⃣",
        "name": "DIGIT TWO + COMBINING ENCLOSING KEYCAP"
    },
    {
        "id": "0033-20e3",
        "emoji": "3⃣",
        "name": "DIGIT THREE + COMBINING ENCLOSING KEYCAP"
    },
    {
        "id": "0035-20e3",
        "emoji": "5⃣",
        "name": "DIGIT FIVE + COMBINING ENCLOSING KEYCAP"
    },
    {
        "id": "0034-20e3",
        "emoji": "4⃣",
        "name": "DIGIT FOUR + COMBINING ENCLOSING KEYCAP"
    },
    {
        "id": "0023-20e3",
        "emoji": "#⃣",
        "name": "NUMBER SIGN + COMBINING ENCLOSING KEYCAP"
    },
    {
        "id": "2122",
        "emoji": "™",
        "name": "TRADE MARK SIGN"
    },
    {
        "id": "2139",
        "emoji": "ℹ",
        "name": "INFORMATION SOURCE"
    },
    {
        "id": "2194",
        "emoji": "↔",
        "name": "LEFT RIGHT ARROW"
    },
    {
        "id": "2195",
        "emoji": "↕",
        "name": "UP DOWN ARROW"
    },
    {
        "id": "2196",
        "emoji": "↖",
        "name": "NORTH WEST ARROW"
    },
    {
        "id": "2197",
        "emoji": "↗",
        "name": "NORTH EAST ARROW"
    },
    {
        "id": "2198",
        "emoji": "↘",
        "name": "SOUTH EAST ARROW"
    },
    {
        "id": "2199",
        "emoji": "↙",
        "name": "SOUTH WEST ARROW"
    },
    {
        "id": "21a9",
        "emoji": "↩",
        "name": "LEFTWARDS ARROW WITH HOOK"
    },
    {
        "id": "21aa",
        "emoji": "↪",
        "name": "RIGHTWARDS ARROW WITH HOOK"
    },
    {
        "id": "231a",
        "emoji": "⌚",
        "name": "WATCH"
    },
    {
        "id": "231b",
        "emoji": "⌛",
        "name": "HOURGLASS"
    },
    {
        "id": "23e9",
        "emoji": "⏩",
        "name": "BLACK RIGHT-POINTING DOUBLE TRIANGLE"
    },
    {
        "id": "23ea",
        "emoji": "⏪",
        "name": "BLACK LEFT-POINTING DOUBLE TRIANGLE"
    },
    {
        "id": "23eb",
        "emoji": "⏫",
        "name": "BLACK UP-POINTING DOUBLE TRIANGLE"
    },
    {
        "id": "23ec",
        "emoji": "⏬",
        "name": "BLACK DOWN-POINTING DOUBLE TRIANGLE"
    },
    {
        "id": "23f0",
        "emoji": "⏰",
        "name": "ALARM CLOCK"
    },
    {
        "id": "23f3",
        "emoji": "⏳",
        "name": "HOURGLASS WITH FLOWING SAND"
    },
    {
        "id": "25aa",
        "emoji": "▪",
        "name": "BLACK SMALL SQUARE"
    },
    {
        "id": "25ab",
        "emoji": "▫",
        "name": "WHITE SMALL SQUARE"
    },
    {
        "id": "25b6",
        "emoji": "▶",
        "name": "BLACK RIGHT-POINTING TRIANGLE"
    },
    {
        "id": "25c0",
        "emoji": "◀",
        "name": "BLACK LEFT-POINTING TRIANGLE"
    },
    {
        "id": "25fb",
        "emoji": "◻",
        "name": "WHITE MEDIUM SQUARE"
    },
    {
        "id": "25fc",
        "emoji": "◼",
        "name": "BLACK MEDIUM SQUARE"
    },
    {
        "id": "25fd",
        "emoji": "◽",
        "name": "WHITE MEDIUM SMALL SQUARE"
    },
    {
        "id": "25fe",
        "emoji": "◾",
        "name": "BLACK MEDIUM SMALL SQUARE"
    },
    {
        "id": "2600",
        "emoji": "☀",
        "name": "BLACK SUN WITH RAYS"
    },
    {
        "id": "2601",
        "emoji": "☁",
        "name": "CLOUD"
    },
    {
        "id": "260e",
        "emoji": "☎",
        "name": "BLACK TELEPHONE"
    },
    {
        "id": "2611",
        "emoji": "☑",
        "name": "BALLOT BOX WITH CHECK"
    },
    {
        "id": "2614",
        "emoji": "☔",
        "name": "UMBRELLA WITH RAIN DROPS"
    },
    {
        "id": "2615",
        "emoji": "☕",
        "name": "HOT BEVERAGE"
    },
    {
        "id": "261d",
        "emoji": "☝",
        "name": "WHITE UP POINTING INDEX"
    },
    {
        "id": "263a",
        "emoji": "☺",
        "name": "WHITE SMILING FACE"
    },
    {
        "id": "2648",
        "emoji": "♈",
        "name": "ARIES"
    },
    {
        "id": "2649",
        "emoji": "♉",
        "name": "TAURUS"
    },
    {
        "id": "264a",
        "emoji": "♊",
        "name": "GEMINI"
    },
    {
        "id": "264b",
        "emoji": "♋",
        "name": "CANCER"
    },
    {
        "id": "264c",
        "emoji": "♌",
        "name": "LEO"
    },
    {
        "id": "264d",
        "emoji": "♍",
        "name": "VIRGO"
    },
    {
        "id": "264e",
        "emoji": "♎",
        "name": "LIBRA"
    },
    {
        "id": "264f",
        "emoji": "♏",
        "name": "SCORPIUS"
    },
    {
        "id": "2650",
        "emoji": "♐",
        "name": "SAGITTARIUS"
    },
    {
        "id": "2651",
        "emoji": "♑",
        "name": "CAPRICORN"
    },
    {
        "id": "2652",
        "emoji": "♒",
        "name": "AQUARIUS"
    },
    {
        "id": "2653",
        "emoji": "♓",
        "name": "PISCES"
    },
    {
        "id": "2660",
        "emoji": "♠",
        "name": "BLACK SPADE SUIT"
    },
    {
        "id": "2663",
        "emoji": "♣",
        "name": "BLACK CLUB SUIT"
    },
    {
        "id": "2665",
        "emoji": "♥",
        "name": "BLACK HEART SUIT"
    },
    {
        "id": "2666",
        "emoji": "♦",
        "name": "BLACK DIAMOND SUIT"
    },
    {
        "id": "2668",
        "emoji": "♨",
        "name": "HOT SPRINGS"
    },
    {
        "id": "267b",
        "emoji": "♻",
        "name": "BLACK UNIVERSAL RECYCLING SYMBOL"
    },
    {
        "id": "267f",
        "emoji": "♿",
        "name": "WHEELCHAIR SYMBOL"
    },
    {
        "id": "2693",
        "emoji": "⚓",
        "name": "ANCHOR"
    },
    {
        "id": "26a0",
        "emoji": "⚠",
        "name": "WARNING SIGN"
    },
    {
        "id": "26a1",
        "emoji": "⚡",
        "name": "HIGH VOLTAGE SIGN"
    },
    {
        "id": "26aa",
        "emoji": "⚪",
        "name": "MEDIUM WHITE CIRCLE"
    },
    {
        "id": "26ab",
        "emoji": "⚫",
        "name": "MEDIUM BLACK CIRCLE"
    },
    {
        "id": "26bd",
        "emoji": "⚽",
        "name": "SOCCER BALL"
    },
    {
        "id": "26be",
        "emoji": "⚾",
        "name": "BASEBALL"
    },
    {
        "id": "26c4",
        "emoji": "⛄",
        "name": "SNOWMAN WITHOUT SNOW"
    },
    {
        "id": "26c5",
        "emoji": "⛅",
        "name": "SUN BEHIND CLOUD"
    },
    {
        "id": "26ce",
        "emoji": "⛎",
        "name": "OPHIUCHUS"
    },
    {
        "id": "26d4",
        "emoji": "⛔",
        "name": "NO ENTRY"
    },
    {
        "id": "26ea",
        "emoji": "⛪",
        "name": "CHURCH"
    },
    {
        "id": "26f2",
        "emoji": "⛲",
        "name": "FOUNTAIN"
    },
    {
        "id": "26f3",
        "emoji": "⛳",
        "name": "FLAG IN HOLE"
    },
    {
        "id": "26f5",
        "emoji": "⛵",
        "name": "SAILBOAT"
    },
    {
        "id": "26fa",
        "emoji": "⛺",
        "name": "TENT"
    },
    {
        "id": "26fd",
        "emoji": "⛽",
        "name": "FUEL PUMP"
    },
    {
        "id": "2934",
        "emoji": "⤴",
        "name": "ARROW POINTING RIGHTWARDS THEN CURVING UPWARDS"
    },
    {
        "id": "2935",
        "emoji": "⤵",
        "name": "ARROW POINTING RIGHTWARDS THEN CURVING DOWNWARDS"
    },
    {
        "id": "2b05",
        "emoji": "⬅",
        "name": "LEFTWARDS BLACK ARROW"
    },
    {
        "id": "2b06",
        "emoji": "⬆",
        "name": "UPWARDS BLACK ARROW"
    },
    {
        "id": "2b07",
        "emoji": "⬇",
        "name": "DOWNWARDS BLACK ARROW"
    },
    {
        "id": "2b1b",
        "emoji": "⬛",
        "name": "BLACK LARGE SQUARE"
    },
    {
        "id": "2b1c",
        "emoji": "⬜",
        "name": "WHITE LARGE SQUARE"
    },
    {
        "id": "2b50",
        "emoji": "⭐",
        "name": "WHITE MEDIUM STAR"
    },
    {
        "id": "2b55",
        "emoji": "⭕",
        "name": "HEAVY LARGE CIRCLE"
    },
    {
        "id": "3030",
        "emoji": "〰",
        "name": "WAVY DASH"
    },
    {
        "id": "303d",
        "emoji": "〽",
        "name": "PART ALTERNATION MARK"
    },
    {
        "id": "3297",
        "emoji": "㊗",
        "name": "CIRCLED IDEOGRAPH CONGRATULATION"
    },
    {
        "id": "3299",
        "emoji": "㊙",
        "name": "CIRCLED IDEOGRAPH SECRET"
    },
    {
        "id": "1f004",
        "emoji": "🀄",
        "name": "MAHJONG TILE RED DRAGON"
    },
    {
        "id": "1f0cf",
        "emoji": "🃏",
        "name": "PLAYING CARD BLACK JOKER"
    },
    {
        "id": "1f300",
        "emoji": "🌀",
        "name": "CYCLONE"
    },
    {
        "id": "1f301",
        "emoji": "🌁",
        "name": "FOGGY"
    },
    {
        "id": "1f302",
        "emoji": "🌂",
        "name": "CLOSED UMBRELLA"
    },
    {
        "id": "1f303",
        "emoji": "🌃",
        "name": "NIGHT WITH STARS"
    },
    {
        "id": "1f304",
        "emoji": "🌄",
        "name": "SUNRISE OVER MOUNTAINS"
    },
    {
        "id": "1f305",
        "emoji": "🌅",
        "name": "SUNRISE"
    },
    {
        "id": "1f306",
        "emoji": "🌆",
        "name": "CITYSCAPE AT DUSK"
    },
    {
        "id": "1f307",
        "emoji": "🌇",
        "name": "SUNSET OVER BUILDINGS"
    },
    {
        "id": "1f308",
        "emoji": "🌈",
        "name": "RAINBOW"
    },
    {
        "id": "1f309",
        "emoji": "🌉",
        "name": "BRIDGE AT NIGHT"
    },
    {
        "id": "1f30a",
        "emoji": "🌊",
        "name": "WATER WAVE"
    },
    {
        "id": "1f30b",
        "emoji": "🌋",
        "name": "VOLCANO"
    },
    {
        "id": "1f30c",
        "emoji": "🌌",
        "name": "MILKY WAY"
    },
    {
        "id": "1f30f",
        "emoji": "🌏",
        "name": "EARTH GLOBE ASIA-AUSTRALIA"
    },
    {
        "id": "1f311",
        "emoji": "🌑",
        "name": "NEW MOON SYMBOL"
    },
    {
        "id": "1f313",
        "emoji": "🌓",
        "name": "FIRST QUARTER MOON SYMBOL"
    },
    {
        "id": "1f314",
        "emoji": "🌔",
        "name": "WAXING GIBBOUS MOON SYMBOL"
    },
    {
        "id": "1f315",
        "emoji": "🌕",
        "name": "FULL MOON SYMBOL"
    },
    {
        "id": "1f319",
        "emoji": "🌙",
        "name": "CRESCENT MOON"
    },
    {
        "id": "1f31b",
        "emoji": "🌛",
        "name": "FIRST QUARTER MOON WITH FACE"
    },
    {
        "id": "1f31f",
        "emoji": "🌟",
        "name": "GLOWING STAR"
    },
    {
        "id": "1f320",
        "emoji": "🌠",
        "name": "SHOOTING STAR"
    },
    {
        "id": "1f330",
        "emoji": "🌰",
        "name": "CHESTNUT"
    },
    {
        "id": "1f331",
        "emoji": "🌱",
        "name": "SEEDLING"
    },
    {
        "id": "1f334",
        "emoji": "🌴",
        "name": "PALM TREE"
    },
    {
        "id": "1f335",
        "emoji": "🌵",
        "name": "CACTUS"
    },
    {
        "id": "1f337",
        "emoji": "🌷",
        "name": "TULIP"
    },
    {
        "id": "1f338",
        "emoji": "🌸",
        "name": "CHERRY BLOSSOM"
    },
    {
        "id": "1f339",
        "emoji": "🌹",
        "name": "ROSE"
    },
    {
        "id": "1f33a",
        "emoji": "🌺",
        "name": "HIBISCUS"
    },
    {
        "id": "1f33b",
        "emoji": "🌻",
        "name": "SUNFLOWER"
    },
    {
        "id": "1f33c",
        "emoji": "🌼",
        "name": "BLOSSOM"
    },
    {
        "id": "1f33d",
        "emoji": "🌽",
        "name": "EAR OF MAIZE"
    },
    {
        "id": "1f33e",
        "emoji": "🌾",
        "name": "EAR OF RICE"
    },
    {
        "id": "1f33f",
        "emoji": "🌿",
        "name": "HERB"
    },
    {
        "id": "1f340",
        "emoji": "🍀",
        "name": "FOUR LEAF CLOVER"
    },
    {
        "id": "1f341",
        "emoji": "🍁",
        "name": "MAPLE LEAF"
    },
    {
        "id": "1f342",
        "emoji": "🍂",
        "name": "FALLEN LEAF"
    },
    {
        "id": "1f343",
        "emoji": "🍃",
        "name": "LEAF FLUTTERING IN WIND"
    },
    {
        "id": "1f344",
        "emoji": "🍄",
        "name": "MUSHROOM"
    },
    {
        "id": "1f345",
        "emoji": "🍅",
        "name": "TOMATO"
    },
    {
        "id": "1f346",
        "emoji": "🍆",
        "name": "AUBERGINE"
    },
    {
        "id": "1f347",
        "emoji": "🍇",
        "name": "GRAPES"
    },
    {
        "id": "1f348",
        "emoji": "🍈",
        "name": "MELON"
    },
    {
        "id": "1f349",
        "emoji": "🍉",
        "name": "WATERMELON"
    },
    {
        "id": "1f34a",
        "emoji": "🍊",
        "name": "TANGERINE"
    },
    {
        "id": "1f34c",
        "emoji": "🍌",
        "name": "BANANA"
    },
    {
        "id": "1f34d",
        "emoji": "🍍",
        "name": "PINEAPPLE"
    },
    {
        "id": "1f34e",
        "emoji": "🍎",
        "name": "RED APPLE"
    },
    {
        "id": "1f34f",
        "emoji": "🍏",
        "name": "GREEN APPLE"
    },
    {
        "id": "1f351",
        "emoji": "🍑",
        "name": "PEACH"
    },
    {
        "id": "1f352",
        "emoji": "🍒",
        "name": "CHERRIES"
    },
    {
        "id": "1f353",
        "emoji": "🍓",
        "name": "STRAWBERRY"
    },
    {
        "id": "1f354",
        "emoji": "🍔",
        "name": "HAMBURGER"
    },
    {
        "id": "1f355",
        "emoji": "🍕",
        "name": "SLICE OF PIZZA"
    },
    {
        "id": "1f356",
        "emoji": "🍖",
        "name": "MEAT ON BONE"
    },
    {
        "id": "1f357",
        "emoji": "🍗",
        "name": "POULTRY LEG"
    },
    {
        "id": "1f358",
        "emoji": "🍘",
        "name": "RICE CRACKER"
    },
    {
        "id": "1f359",
        "emoji": "🍙",
        "name": "RICE BALL"
    },
    {
        "id": "1f35a",
        "emoji": "🍚",
        "name": "COOKED RICE"
    },
    {
        "id": "1f35b",
        "emoji": "🍛",
        "name": "CURRY AND RICE"
    },
    {
        "id": "1f35c",
        "emoji": "🍜",
        "name": "STEAMING BOWL"
    },
    {
        "id": "1f35d",
        "emoji": "🍝",
        "name": "SPAGHETTI"
    },
    {
        "id": "1f35e",
        "emoji": "🍞",
        "name": "BREAD"
    },
    {
        "id": "1f35f",
        "emoji": "🍟",
        "name": "FRENCH FRIES"
    },
    {
        "id": "1f360",
        "emoji": "🍠",
        "name": "ROASTED SWEET POTATO"
    },
    {
        "id": "1f361",
        "emoji": "🍡",
        "name": "DANGO"
    },
    {
        "id": "1f362",
        "emoji": "🍢",
        "name": "ODEN"
    },
    {
        "id": "1f363",
        "emoji": "🍣",
        "name": "SUSHI"
    },
    {
        "id": "1f364",
        "emoji": "🍤",
        "name": "FRIED SHRIMP"
    },
    {
        "id": "1f365",
        "emoji": "🍥",
        "name": "FISH CAKE WITH SWIRL DESIGN"
    },
    {
        "id": "1f366",
        "emoji": "🍦",
        "name": "SOFT ICE CREAM"
    },
    {
        "id": "1f367",
        "emoji": "🍧",
        "name": "SHAVED ICE"
    },
    {
        "id": "1f368",
        "emoji": "🍨",
        "name": "ICE CREAM"
    },
    {
        "id": "1f369",
        "emoji": "🍩",
        "name": "DOUGHNUT"
    },
    {
        "id": "1f36a",
        "emoji": "🍪",
        "name": "COOKIE"
    },
    {
        "id": "1f36b",
        "emoji": "🍫",
        "name": "CHOCOLATE BAR"
    },
    {
        "id": "1f36c",
        "emoji": "🍬",
        "name": "CANDY"
    },
    {
        "id": "1f36d",
        "emoji": "🍭",
        "name": "LOLLIPOP"
    },
    {
        "id": "1f36e",
        "emoji": "🍮",
        "name": "CUSTARD"
    },
    {
        "id": "1f36f",
        "emoji": "🍯",
        "name": "HONEY POT"
    },
    {
        "id": "1f370",
        "emoji": "🍰",
        "name": "SHORTCAKE"
    },
    {
        "id": "1f371",
        "emoji": "🍱",
        "name": "BENTO BOX"
    },
    {
        "id": "1f372",
        "emoji": "🍲",
        "name": "POT OF FOOD"
    },
    {
        "id": "1f373",
        "emoji": "🍳",
        "name": "COOKING"
    },
    {
        "id": "1f374",
        "emoji": "🍴",
        "name": "FORK AND KNIFE"
    },
    {
        "id": "1f375",
        "emoji": "🍵",
        "name": "TEACUP WITHOUT HANDLE"
    },
    {
        "id": "1f376",
        "emoji": "🍶",
        "name": "SAKE BOTTLE AND CUP"
    },
    {
        "id": "1f377",
        "emoji": "🍷",
        "name": "WINE GLASS"
    },
    {
        "id": "1f378",
        "emoji": "🍸",
        "name": "COCKTAIL GLASS"
    },
    {
        "id": "1f379",
        "emoji": "🍹",
        "name": "TROPICAL DRINK"
    },
    {
        "id": "1f37a",
        "emoji": "🍺",
        "name": "BEER MUG"
    },
    {
        "id": "1f37b",
        "emoji": "🍻",
        "name": "CLINKING BEER MUGS"
    },
    {
        "id": "1f380",
        "emoji": "🎀",
        "name": "RIBBON"
    },
    {
        "id": "1f381",
        "emoji": "🎁",
        "name": "WRAPPED PRESENT"
    },
    {
        "id": "1f382",
        "emoji": "🎂",
        "name": "BIRTHDAY CAKE"
    },
    {
        "id": "1f383",
        "emoji": "🎃",
        "name": "JACK-O-LANTERN"
    },
    {
        "id": "1f384",
        "emoji": "🎄",
        "name": "CHRISTMAS TREE"
    },
    {
        "id": "1f385",
        "emoji": "🎅",
        "name": "FATHER CHRISTMAS"
    },
    {
        "id": "1f386",
        "emoji": "🎆",
        "name": "FIREWORKS"
    },
    {
        "id": "1f387",
        "emoji": "🎇",
        "name": "FIREWORK SPARKLER"
    },
    {
        "id": "1f388",
        "emoji": "🎈",
        "name": "BALLOON"
    },
    {
        "id": "1f389",
        "emoji": "🎉",
        "name": "PARTY POPPER"
    },
    {
        "id": "1f38a",
        "emoji": "🎊",
        "name": "CONFETTI BALL"
    },
    {
        "id": "1f38b",
        "emoji": "🎋",
        "name": "TANABATA TREE"
    },
    {
        "id": "1f38c",
        "emoji": "🎌",
        "name": "CROSSED FLAGS"
    },
    {
        "id": "1f38d",
        "emoji": "🎍",
        "name": "PINE DECORATION"
    },
    {
        "id": "1f38e",
        "emoji": "🎎",
        "name": "JAPANESE DOLLS"
    },
    {
        "id": "1f38f",
        "emoji": "🎏",
        "name": "CARP STREAMER"
    },
    {
        "id": "1f390",
        "emoji": "🎐",
        "name": "WIND CHIME"
    },
    {
        "id": "1f391",
        "emoji": "🎑",
        "name": "MOON VIEWING CEREMONY"
    },
    {
        "id": "1f392",
        "emoji": "🎒",
        "name": "SCHOOL SATCHEL"
    },
    {
        "id": "1f393",
        "emoji": "🎓",
        "name": "GRADUATION CAP"
    },
    {
        "id": "1f3a0",
        "emoji": "🎠",
        "name": "CAROUSEL HORSE"
    },
    {
        "id": "1f3a1",
        "emoji": "🎡",
        "name": "FERRIS WHEEL"
    },
    {
        "id": "1f3a2",
        "emoji": "🎢",
        "name": "ROLLER COASTER"
    },
    {
        "id": "1f3a3",
        "emoji": "🎣",
        "name": "FISHING POLE AND FISH"
    },
    {
        "id": "1f3a4",
        "emoji": "🎤",
        "name": "MICROPHONE"
    },
    {
        "id": "1f3a5",
        "emoji": "🎥",
        "name": "MOVIE CAMERA"
    },
    {
        "id": "1f3a6",
        "emoji": "🎦",
        "name": "CINEMA"
    },
    {
        "id": "1f3a7",
        "emoji": "🎧",
        "name": "HEADPHONE"
    },
    {
        "id": "1f3a8",
        "emoji": "🎨",
        "name": "ARTIST PALETTE"
    },
    {
        "id": "1f3a9",
        "emoji": "🎩",
        "name": "TOP HAT"
    },
    {
        "id": "1f3aa",
        "emoji": "🎪",
        "name": "CIRCUS TENT"
    },
    {
        "id": "1f3ab",
        "emoji": "🎫",
        "name": "TICKET"
    },
    {
        "id": "1f3ac",
        "emoji": "🎬",
        "name": "CLAPPER BOARD"
    },
    {
        "id": "1f3ad",
        "emoji": "🎭",
        "name": "PERFORMING ARTS"
    },
    {
        "id": "1f3ae",
        "emoji": "🎮",
        "name": "VIDEO GAME"
    },
    {
        "id": "1f3af",
        "emoji": "🎯",
        "name": "DIRECT HIT"
    },
    {
        "id": "1f3b0",
        "emoji": "🎰",
        "name": "SLOT MACHINE"
    },
    {
        "id": "1f3b1",
        "emoji": "🎱",
        "name": "BILLIARDS"
    },
    {
        "id": "1f3b2",
        "emoji": "🎲",
        "name": "GAME DIE"
    },
    {
        "id": "1f3b3",
        "emoji": "🎳",
        "name": "BOWLING"
    },
    {
        "id": "1f3b4",
        "emoji": "🎴",
        "name": "FLOWER PLAYING CARDS"
    },
    {
        "id": "1f3b5",
        "emoji": "🎵",
        "name": "MUSICAL NOTE"
    },
    {
        "id": "1f3b6",
        "emoji": "🎶",
        "name": "MULTIPLE MUSICAL NOTES"
    },
    {
        "id": "1f3b7",
        "emoji": "🎷",
        "name": "SAXOPHONE"
    },
    {
        "id": "1f3b8",
        "emoji": "🎸",
        "name": "GUITAR"
    },
    {
        "id": "1f3b9",
        "emoji": "🎹",
        "name": "MUSICAL KEYBOARD"
    },
    {
        "id": "1f3ba",
        "emoji": "🎺",
        "name": "TRUMPET"
    },
    {
        "id": "1f3bb",
        "emoji": "🎻",
        "name": "VIOLIN"
    },
    {
        "id": "1f3bc",
        "emoji": "🎼",
        "name": "MUSICAL SCORE"
    },
    {
        "id": "1f3bd",
        "emoji": "🎽",
        "name": "RUNNING SHIRT WITH SASH"
    },
    {
        "id": "1f3be",
        "emoji": "🎾",
        "name": "TENNIS RACQUET AND BALL"
    },
    {
        "id": "1f3bf",
        "emoji": "🎿",
        "name": "SKI AND SKI BOOT"
    },
    {
        "id": "1f3c0",
        "emoji": "🏀",
        "name": "BASKETBALL AND HOOP"
    },
    {
        "id": "1f3c1",
        "emoji": "🏁",
        "name": "CHEQUERED FLAG"
    },
    {
        "id": "1f3c2",
        "emoji": "🏂",
        "name": "SNOWBOARDER"
    },
    {
        "id": "1f3c3",
        "emoji": "🏃",
        "name": "RUNNER"
    },
    {
        "id": "1f3c4",
        "emoji": "🏄",
        "name": "SURFER"
    },
    {
        "id": "1f3c6",
        "emoji": "🏆",
        "name": "TROPHY"
    },
    {
        "id": "1f3c8",
        "emoji": "🏈",
        "name": "AMERICAN FOOTBALL"
    },
    {
        "id": "1f3ca",
        "emoji": "🏊",
        "name": "SWIMMER"
    },
    {
        "id": "1f3e0",
        "emoji": "🏠",
        "name": "HOUSE BUILDING"
    },
    {
        "id": "1f3e1",
        "emoji": "🏡",
        "name": "HOUSE WITH GARDEN"
    },
    {
        "id": "1f3e2",
        "emoji": "🏢",
        "name": "OFFICE BUILDING"
    },
    {
        "id": "1f3e3",
        "emoji": "🏣",
        "name": "JAPANESE POST OFFICE"
    },
    {
        "id": "1f3e5",
        "emoji": "🏥",
        "name": "HOSPITAL"
    },
    {
        "id": "1f3e6",
        "emoji": "🏦",
        "name": "BANK"
    },
    {
        "id": "1f3e7",
        "emoji": "🏧",
        "name": "AUTOMATED TELLER MACHINE"
    },
    {
        "id": "1f3e8",
        "emoji": "🏨",
        "name": "HOTEL"
    },
    {
        "id": "1f3e9",
        "emoji": "🏩",
        "name": "LOVE HOTEL"
    },
    {
        "id": "1f3ea",
        "emoji": "🏪",
        "name": "CONVENIENCE STORE"
    },
    {
        "id": "1f3eb",
        "emoji": "🏫",
        "name": "SCHOOL"
    },
    {
        "id": "1f3ec",
        "emoji": "🏬",
        "name": "DEPARTMENT STORE"
    },
    {
        "id": "1f3ed",
        "emoji": "🏭",
        "name": "FACTORY"
    },
    {
        "id": "1f3ee",
        "emoji": "🏮",
        "name": "IZAKAYA LANTERN"
    },
    {
        "id": "1f3ef",
        "emoji": "🏯",
        "name": "JAPANESE CASTLE"
    },
    {
        "id": "1f3f0",
        "emoji": "🏰",
        "name": "EUROPEAN CASTLE"
    },
    {
        "id": "1f40c",
        "emoji": "🐌",
        "name": "SNAIL"
    },
    {
        "id": "1f40d",
        "emoji": "🐍",
        "name": "SNAKE"
    },
    {
        "id": "1f40e",
        "emoji": "🐎",
        "name": "HORSE"
    },
    {
        "id": "1f411",
        "emoji": "🐑",
        "name": "SHEEP"
    },
    {
        "id": "1f412",
        "emoji": "🐒",
        "name": "MONKEY"
    },
    {
        "id": "1f414",
        "emoji": "🐔",
        "name": "CHICKEN"
    },
    {
        "id": "1f417",
        "emoji": "🐗",
        "name": "BOAR"
    },
    {
        "id": "1f418",
        "emoji": "🐘",
        "name": "ELEPHANT"
    },
    {
        "id": "1f419",
        "emoji": "🐙",
        "name": "OCTOPUS"
    },
    {
        "id": "1f41a",
        "emoji": "🐚",
        "name": "SPIRAL SHELL"
    },
    {
        "id": "1f41b",
        "emoji": "🐛",
        "name": "BUG"
    },
    {
        "id": "1f41c",
        "emoji": "🐜",
        "name": "ANT"
    },
    {
        "id": "1f41d",
        "emoji": "🐝",
        "name": "HONEYBEE"
    },
    {
        "id": "1f41e",
        "emoji": "🐞",
        "name": "LADY BEETLE"
    },
    {
        "id": "1f41f",
        "emoji": "🐟",
        "name": "FISH"
    },
    {
        "id": "1f420",
        "emoji": "🐠",
        "name": "TROPICAL FISH"
    },
    {
        "id": "1f421",
        "emoji": "🐡",
        "name": "BLOWFISH"
    },
    {
        "id": "1f422",
        "emoji": "🐢",
        "name": "TURTLE"
    },
    {
        "id": "1f423",
        "emoji": "🐣",
        "name": "HATCHING CHICK"
    },
    {
        "id": "1f424",
        "emoji": "🐤",
        "name": "BABY CHICK"
    },
    {
        "id": "1f425",
        "emoji": "🐥",
        "name": "FRONT-FACING BABY CHICK"
    },
    {
        "id": "1f426",
        "emoji": "🐦",
        "name": "BIRD"
    },
    {
        "id": "1f427",
        "emoji": "🐧",
        "name": "PENGUIN"
    },
    {
        "id": "1f428",
        "emoji": "🐨",
        "name": "KOALA"
    },
    {
        "id": "1f429",
        "emoji": "🐩",
        "name": "POODLE"
    },
    {
        "id": "1f42b",
        "emoji": "🐫",
        "name": "BACTRIAN CAMEL"
    },
    {
        "id": "1f42c",
        "emoji": "🐬",
        "name": "DOLPHIN"
    },
    {
        "id": "1f42d",
        "emoji": "🐭",
        "name": "MOUSE FACE"
    },
    {
        "id": "1f42e",
        "emoji": "🐮",
        "name": "COW FACE"
    },
    {
        "id": "1f42f",
        "emoji": "🐯",
        "name": "TIGER FACE"
    },
    {
        "id": "1f430",
        "emoji": "🐰",
        "name": "RABBIT FACE"
    },
    {
        "id": "1f431",
        "emoji": "🐱",
        "name": "CAT FACE"
    },
    {
        "id": "1f432",
        "emoji": "🐲",
        "name": "DRAGON FACE"
    },
    {
        "id": "1f433",
        "emoji": "🐳",
        "name": "SPOUTING WHALE"
    },
    {
        "id": "1f434",
        "emoji": "🐴",
        "name": "HORSE FACE"
    },
    {
        "id": "1f435",
        "emoji": "🐵",
        "name": "MONKEY FACE"
    },
    {
        "id": "1f436",
        "emoji": "🐶",
        "name": "DOG FACE"
    },
    {
        "id": "1f437",
        "emoji": "🐷",
        "name": "PIG FACE"
    },
    {
        "id": "1f438",
        "emoji": "🐸",
        "name": "FROG FACE"
    },
    {
        "id": "1f439",
        "emoji": "🐹",
        "name": "HAMSTER FACE"
    },
    {
        "id": "1f43a",
        "emoji": "🐺",
        "name": "WOLF FACE"
    },
    {
        "id": "1f43b",
        "emoji": "🐻",
        "name": "BEAR FACE"
    },
    {
        "id": "1f43c",
        "emoji": "🐼",
        "name": "PANDA FACE"
    },
    {
        "id": "1f43d",
        "emoji": "🐽",
        "name": "PIG NOSE"
    },
    {
        "id": "1f43e",
        "emoji": "🐾",
        "name": "PAW PRINTS"
    },
    {
        "id": "1f440",
        "emoji": "👀",
        "name": "EYES"
    },
    {
        "id": "1f442",
        "emoji": "👂",
        "name": "EAR"
    },
    {
        "id": "1f443",
        "emoji": "👃",
        "name": "NOSE"
    },
    {
        "id": "1f444",
        "emoji": "👄",
        "name": "MOUTH"
    },
    {
        "id": "1f445",
        "emoji": "👅",
        "name": "TONGUE"
    },
    {
        "id": "1f446",
        "emoji": "👆",
        "name": "WHITE UP POINTING BACKHAND INDEX"
    },
    {
        "id": "1f447",
        "emoji": "👇",
        "name": "WHITE DOWN POINTING BACKHAND INDEX"
    },
    {
        "id": "1f448",
        "emoji": "👈",
        "name": "WHITE LEFT POINTING BACKHAND INDEX"
    },
    {
        "id": "1f449",
        "emoji": "👉",
        "name": "WHITE RIGHT POINTING BACKHAND INDEX"
    },
    {
        "id": "1f44a",
        "emoji": "👊",
        "name": "FISTED HAND SIGN"
    },
    {
        "id": "1f44b",
        "emoji": "👋",
        "name": "WAVING HAND SIGN"
    },
    {
        "id": "1f44c",
        "emoji": "👌",
        "name": "OK HAND SIGN"
    },
    {
        "id": "1f44d",
        "emoji": "👍",
        "name": "THUMBS UP SIGN"
    },
    {
        "id": "1f44e",
        "emoji": "👎",
        "name": "THUMBS DOWN SIGN"
    },
    {
        "id": "1f44f",
        "emoji": "👏",
        "name": "CLAPPING HANDS SIGN"
    },
    {
        "id": "1f450",
        "emoji": "👐",
        "name": "OPEN HANDS SIGN"
    },
    {
        "id": "1f451",
        "emoji": "👑",
        "name": "CROWN"
    },
    {
        "id": "1f452",
        "emoji": "👒",
        "name": "WOMANS HAT"
    },
    {
        "id": "1f453",
        "emoji": "👓",
        "name": "EYEGLASSES"
    },
    {
        "id": "1f454",
        "emoji": "👔",
        "name": "NECKTIE"
    },
    {
        "id": "1f455",
        "emoji": "👕",
        "name": "T-SHIRT"
    },
    {
        "id": "1f456",
        "emoji": "👖",
        "name": "JEANS"
    },
    {
        "id": "1f457",
        "emoji": "👗",
        "name": "DRESS"
    },
    {
        "id": "1f458",
        "emoji": "👘",
        "name": "KIMONO"
    },
    {
        "id": "1f459",
        "emoji": "👙",
        "name": "BIKINI"
    },
    {
        "id": "1f45a",
        "emoji": "👚",
        "name": "WOMANS CLOTHES"
    },
    {
        "id": "1f45b",
        "emoji": "👛",
        "name": "PURSE"
    },
    {
        "id": "1f45c",
        "emoji": "👜",
        "name": "HANDBAG"
    },
    {
        "id": "1f45d",
        "emoji": "👝",
        "name": "POUCH"
    },
    {
        "id": "1f45e",
        "emoji": "👞",
        "name": "MANS SHOE"
    },
    {
        "id": "1f45f",
        "emoji": "👟",
        "name": "ATHLETIC SHOE"
    },
    {
        "id": "1f460",
        "emoji": "👠",
        "name": "HIGH-HEELED SHOE"
    },
    {
        "id": "1f461",
        "emoji": "👡",
        "name": "WOMANS SANDAL"
    },
    {
        "id": "1f462",
        "emoji": "👢",
        "name": "WOMANS BOOTS"
    },
    {
        "id": "1f463",
        "emoji": "👣",
        "name": "FOOTPRINTS"
    },
    {
        "id": "1f464",
        "emoji": "👤",
        "name": "BUST IN SILHOUETTE"
    },
    {
        "id": "1f466",
        "emoji": "👦",
        "name": "BOY"
    },
    {
        "id": "1f467",
        "emoji": "👧",
        "name": "GIRL"
    },
    {
        "id": "1f468",
        "emoji": "👨",
        "name": "MAN"
    },
    {
        "id": "1f469",
        "emoji": "👩",
        "name": "WOMAN"
    },
    {
        "id": "1f46a",
        "emoji": "👪",
        "name": "FAMILY"
    },
    {
        "id": "1f46b",
        "emoji": "👫",
        "name": "MAN AND WOMAN HOLDING HANDS"
    },
    {
        "id": "1f46e",
        "emoji": "👮",
        "name": "POLICE OFFICER"
    },
    {
        "id": "1f46f",
        "emoji": "👯",
        "name": "WOMAN WITH BUNNY EARS"
    },
    {
        "id": "1f470",
        "emoji": "👰",
        "name": "BRIDE WITH VEIL"
    },
    {
        "id": "1f471",
        "emoji": "👱",
        "name": "PERSON WITH BLOND HAIR"
    },
    {
        "id": "1f472",
        "emoji": "👲",
        "name": "MAN WITH GUA PI MAO"
    },
    {
        "id": "1f473",
        "emoji": "👳",
        "name": "MAN WITH TURBAN"
    },
    {
        "id": "1f474",
        "emoji": "👴",
        "name": "OLDER MAN"
    },
    {
        "id": "1f475",
        "emoji": "👵",
        "name": "OLDER WOMAN"
    },
    {
        "id": "1f476",
        "emoji": "👶",
        "name": "BABY"
    },
    {
        "id": "1f477",
        "emoji": "👷",
        "name": "CONSTRUCTION WORKER"
    },
    {
        "id": "1f478",
        "emoji": "👸",
        "name": "PRINCESS"
    },
    {
        "id": "1f479",
        "emoji": "👹",
        "name": "JAPANESE OGRE"
    },
    {
        "id": "1f47a",
        "emoji": "👺",
        "name": "JAPANESE GOBLIN"
    },
    {
        "id": "1f47b",
        "emoji": "👻",
        "name": "GHOST"
    },
    {
        "id": "1f47c",
        "emoji": "👼",
        "name": "BABY ANGEL"
    },
    {
        "id": "1f47d",
        "emoji": "👽",
        "name": "EXTRATERRESTRIAL ALIEN"
    },
    {
        "id": "1f47e",
        "emoji": "👾",
        "name": "ALIEN MONSTER"
    },
    {
        "id": "1f47f",
        "emoji": "👿",
        "name": "IMP"
    },
    {
        "id": "1f480",
        "emoji": "💀",
        "name": "SKULL"
    },
    {
        "id": "1f481",
        "emoji": "💁",
        "name": "INFORMATION DESK PERSON"
    },
    {
        "id": "1f482",
        "emoji": "💂",
        "name": "GUARDSMAN"
    },
    {
        "id": "1f483",
        "emoji": "💃",
        "name": "DANCER"
    },
    {
        "id": "1f484",
        "emoji": "💄",
        "name": "LIPSTICK"
    },
    {
        "id": "1f485",
        "emoji": "💅",
        "name": "NAIL POLISH"
    },
    {
        "id": "1f486",
        "emoji": "💆",
        "name": "FACE MASSAGE"
    },
    {
        "id": "1f487",
        "emoji": "💇",
        "name": "HAIRCUT"
    },
    {
        "id": "1f488",
        "emoji": "💈",
        "name": "BARBER POLE"
    },
    {
        "id": "1f489",
        "emoji": "💉",
        "name": "SYRINGE"
    },
    {
        "id": "1f48a",
        "emoji": "💊",
        "name": "PILL"
    },
    {
        "id": "1f48b",
        "emoji": "💋",
        "name": "KISS MARK"
    },
    {
        "id": "1f48c",
        "emoji": "💌",
        "name": "LOVE LETTER"
    },
    {
        "id": "1f48d",
        "emoji": "💍",
        "name": "RING"
    },
    {
        "id": "1f48e",
        "emoji": "💎",
        "name": "GEM STONE"
    },
    {
        "id": "1f48f",
        "emoji": "💏",
        "name": "KISS"
    },
    {
        "id": "1f490",
        "emoji": "💐",
        "name": "BOUQUET"
    },
    {
        "id": "1f491",
        "emoji": "💑",
        "name": "COUPLE WITH HEART"
    },
    {
        "id": "1f492",
        "emoji": "💒",
        "name": "WEDDING"
    },
    {
        "id": "1f493",
        "emoji": "💓",
        "name": "BEATING HEART"
    },
    {
        "id": "1f494",
        "emoji": "💔",
        "name": "BROKEN HEART"
    },
    {
        "id": "1f495",
        "emoji": "💕",
        "name": "TWO HEARTS"
    },
    {
        "id": "1f496",
        "emoji": "💖",
        "name": "SPARKLING HEART"
    },
    {
        "id": "1f497",
        "emoji": "💗",
        "name": "GROWING HEART"
    },
    {
        "id": "1f498",
        "emoji": "💘",
        "name": "HEART WITH ARROW"
    },
    {
        "id": "1f499",
        "emoji": "💙",
        "name": "BLUE HEART"
    },
    {
        "id": "1f49a",
        "emoji": "💚",
        "name": "GREEN HEART"
    },
    {
        "id": "1f49b",
        "emoji": "💛",
        "name": "YELLOW HEART"
    },
    {
        "id": "1f49c",
        "emoji": "💜",
        "name": "PURPLE HEART"
    },
    {
        "id": "1f49d",
        "emoji": "💝",
        "name": "HEART WITH RIBBON"
    },
    {
        "id": "1f49e",
        "emoji": "💞",
        "name": "REVOLVING HEARTS"
    },
    {
        "id": "1f49f",
        "emoji": "💟",
        "name": "HEART DECORATION"
    },
    {
        "id": "1f4a0",
        "emoji": "💠",
        "name": "DIAMOND SHAPE WITH A DOT INSIDE"
    },
    {
        "id": "1f4a1",
        "emoji": "💡",
        "name": "ELECTRIC LIGHT BULB"
    },
    {
        "id": "1f4a2",
        "emoji": "💢",
        "name": "ANGER SYMBOL"
    },
    {
        "id": "1f4a3",
        "emoji": "💣",
        "name": "BOMB"
    },
    {
        "id": "1f4a4",
        "emoji": "💤",
        "name": "SLEEPING SYMBOL"
    },
    {
        "id": "1f4a5",
        "emoji": "💥",
        "name": "COLLISION SYMBOL"
    },
    {
        "id": "1f4a6",
        "emoji": "💦",
        "name": "SPLASHING SWEAT SYMBOL"
    },
    {
        "id": "1f4a7",
        "emoji": "💧",
        "name": "DROPLET"
    },
    {
        "id": "1f4a8",
        "emoji": "💨",
        "name": "DASH SYMBOL"
    },
    {
        "id": "1f4a9",
        "emoji": "💩",
        "name": "PILE OF POO"
    },
    {
        "id": "1f4aa",
        "emoji": "💪",
        "name": "FLEXED BICEPS"
    },
    {
        "id": "1f4ab",
        "emoji": "💫",
        "name": "DIZZY SYMBOL"
    },
    {
        "id": "1f4ac",
        "emoji": "💬",
        "name": "SPEECH BALLOON"
    },
    {
        "id": "1f4ae",
        "emoji": "💮",
        "name": "WHITE FLOWER"
    },
    {
        "id": "1f4af",
        "emoji": "💯",
        "name": "HUNDRED POINTS SYMBOL"
    },
    {
        "id": "1f4b0",
        "emoji": "💰",
        "name": "MONEY BAG"
    },
    {
        "id": "1f4b1",
        "emoji": "💱",
        "name": "CURRENCY EXCHANGE"
    },
    {
        "id": "1f4b2",
        "emoji": "💲",
        "name": "HEAVY DOLLAR SIGN"
    },
    {
        "id": "1f4b3",
        "emoji": "💳",
        "name": "CREDIT CARD"
    },
    {
        "id": "1f4b4",
        "emoji": "💴",
        "name": "BANKNOTE WITH YEN SIGN"
    },
    {
        "id": "1f4b5",
        "emoji": "💵",
        "name": "BANKNOTE WITH DOLLAR SIGN"
    },
    {
        "id": "1f4b8",
        "emoji": "💸",
        "name": "MONEY WITH WINGS"
    },
    {
        "id": "1f4b9",
        "emoji": "💹",
        "name": "CHART WITH UPWARDS TREND AND YEN SIGN"
    },
    {
        "id": "1f4ba",
        "emoji": "💺",
        "name": "SEAT"
    },
    {
        "id": "1f4bb",
        "emoji": "💻",
        "name": "PERSONAL COMPUTER"
    },
    {
        "id": "1f4bc",
        "emoji": "💼",
        "name": "BRIEFCASE"
    },
    {
        "id": "1f4bd",
        "emoji": "💽",
        "name": "MINIDISC"
    },
    {
        "id": "1f4be",
        "emoji": "💾",
        "name": "FLOPPY DISK"
    },
    {
        "id": "1f4bf",
        "emoji": "💿",
        "name": "OPTICAL DISC"
    },
    {
        "id": "1f4c0",
        "emoji": "📀",
        "name": "DVD"
    },
    {
        "id": "1f4c1",
        "emoji": "📁",
        "name": "FILE FOLDER"
    },
    {
        "id": "1f4c2",
        "emoji": "📂",
        "name": "OPEN FILE FOLDER"
    },
    {
        "id": "1f4c3",
        "emoji": "📃",
        "name": "PAGE WITH CURL"
    },
    {
        "id": "1f4c4",
        "emoji": "📄",
        "name": "PAGE FACING UP"
    },
    {
        "id": "1f4c5",
        "emoji": "📅",
        "name": "CALENDAR"
    },
    {
        "id": "1f4c6",
        "emoji": "📆",
        "name": "TEAR-OFF CALENDAR"
    },
    {
        "id": "1f4c7",
        "emoji": "📇",
        "name": "CARD INDEX"
    },
    {
        "id": "1f4c8",
        "emoji": "📈",
        "name": "CHART WITH UPWARDS TREND"
    },
    {
        "id": "1f4c9",
        "emoji": "📉",
        "name": "CHART WITH DOWNWARDS TREND"
    },
    {
        "id": "1f4ca",
        "emoji": "📊",
        "name": "BAR CHART"
    },
    {
        "id": "1f4cb",
        "emoji": "📋",
        "name": "CLIPBOARD"
    },
    {
        "id": "1f4cc",
        "emoji": "📌",
        "name": "PUSHPIN"
    },
    {
        "id": "1f4cd",
        "emoji": "📍",
        "name": "ROUND PUSHPIN"
    },
    {
        "id": "1f4ce",
        "emoji": "📎",
        "name": "PAPERCLIP"
    },
    {
        "id": "1f4cf",
        "emoji": "📏",
        "name": "STRAIGHT RULER"
    },
    {
        "id": "1f4d0",
        "emoji": "📐",
        "name": "TRIANGULAR RULER"
    },
    {
        "id": "1f4d1",
        "emoji": "📑",
        "name": "BOOKMARK TABS"
    },
    {
        "id": "1f4d2",
        "emoji": "📒",
        "name": "LEDGER"
    },
    {
        "id": "1f4d3",
        "emoji": "📓",
        "name": "NOTEBOOK"
    },
    {
        "id": "1f4d4",
        "emoji": "📔",
        "name": "NOTEBOOK WITH DECORATIVE COVER"
    },
    {
        "id": "1f4d5",
        "emoji": "📕",
        "name": "CLOSED BOOK"
    },
    {
        "id": "1f4d6",
        "emoji": "📖",
        "name": "OPEN BOOK"
    },
    {
        "id": "1f4d7",
        "emoji": "📗",
        "name": "GREEN BOOK"
    },
    {
        "id": "1f4d8",
        "emoji": "📘",
        "name": "BLUE BOOK"
    },
    {
        "id": "1f4d9",
        "emoji": "📙",
        "name": "ORANGE BOOK"
    },
    {
        "id": "1f4da",
        "emoji": "📚",
        "name": "BOOKS"
    },
    {
        "id": "1f4db",
        "emoji": "📛",
        "name": "NAME BADGE"
    },
    {
        "id": "1f4dc",
        "emoji": "📜",
        "name": "SCROLL"
    },
    {
        "id": "1f4dd",
        "emoji": "📝",
        "name": "MEMO"
    },
    {
        "id": "1f4de",
        "emoji": "📞",
        "name": "TELEPHONE RECEIVER"
    },
    {
        "id": "1f4df",
        "emoji": "📟",
        "name": "PAGER"
    },
    {
        "id": "1f4e0",
        "emoji": "📠",
        "name": "FAX MACHINE"
    },
    {
        "id": "1f4e1",
        "emoji": "📡",
        "name": "SATELLITE ANTENNA"
    },
    {
        "id": "1f4e2",
        "emoji": "📢",
        "name": "PUBLIC ADDRESS LOUDSPEAKER"
    },
    {
        "id": "1f4e3",
        "emoji": "📣",
        "name": "CHEERING MEGAPHONE"
    },
    {
        "id": "1f4e4",
        "emoji": "📤",
        "name": "OUTBOX TRAY"
    },
    {
        "id": "1f4e5",
        "emoji": "📥",
        "name": "INBOX TRAY"
    },
    {
        "id": "1f4e6",
        "emoji": "📦",
        "name": "PACKAGE"
    },
    {
        "id": "1f4e7",
        "emoji": "📧",
        "name": "E-MAIL SYMBOL"
    },
    {
        "id": "1f4e8",
        "emoji": "📨",
        "name": "INCOMING ENVELOPE"
    },
    {
        "id": "1f4e9",
        "emoji": "📩",
        "name": "ENVELOPE WITH DOWNWARDS ARROW ABOVE"
    },
    {
        "id": "1f4ea",
        "emoji": "📪",
        "name": "CLOSED MAILBOX WITH LOWERED FLAG"
    },
    {
        "id": "1f4eb",
        "emoji": "📫",
        "name": "CLOSED MAILBOX WITH RAISED FLAG"
    },
    {
        "id": "1f4ee",
        "emoji": "📮",
        "name": "POSTBOX"
    },
    {
        "id": "1f4f0",
        "emoji": "📰",
        "name": "NEWSPAPER"
    },
    {
        "id": "1f4f1",
        "emoji": "📱",
        "name": "MOBILE PHONE"
    },
    {
        "id": "1f4f2",
        "emoji": "📲",
        "name": "MOBILE PHONE WITH RIGHTWARDS ARROW AT LEFT"
    },
    {
        "id": "1f4f3",
        "emoji": "📳",
        "name": "VIBRATION MODE"
    },
    {
        "id": "1f4f4",
        "emoji": "📴",
        "name": "MOBILE PHONE OFF"
    },
    {
        "id": "1f4f6",
        "emoji": "📶",
        "name": "ANTENNA WITH BARS"
    },
    {
        "id": "1f4f7",
        "emoji": "📷",
        "name": "CAMERA"
    },
    {
        "id": "1f4f9",
        "emoji": "📹",
        "name": "VIDEO CAMERA"
    },
    {
        "id": "1f4fa",
        "emoji": "📺",
        "name": "TELEVISION"
    },
    {
        "id": "1f4fb",
        "emoji": "📻",
        "name": "RADIO"
    },
    {
        "id": "1f4fc",
        "emoji": "📼",
        "name": "VIDEOCASSETTE"
    },
    {
        "id": "1f503",
        "emoji": "🔃",
        "name": "CLOCKWISE DOWNWARDS AND UPWARDS OPEN CIRCLE ARROWS"
    },
    {
        "id": "1f50a",
        "emoji": "🔊",
        "name": "SPEAKER WITH THREE SOUND WAVES"
    },
    {
        "id": "1f50b",
        "emoji": "🔋",
        "name": "BATTERY"
    },
    {
        "id": "1f50c",
        "emoji": "🔌",
        "name": "ELECTRIC PLUG"
    },
    {
        "id": "1f50d",
        "emoji": "🔍",
        "name": "LEFT-POINTING MAGNIFYING GLASS"
    },
    {
        "id": "1f50e",
        "emoji": "🔎",
        "name": "RIGHT-POINTING MAGNIFYING GLASS"
    },
    {
        "id": "1f50f",
        "emoji": "🔏",
        "name": "LOCK WITH INK PEN"
    },
    {
        "id": "1f510",
        "emoji": "🔐",
        "name": "CLOSED LOCK WITH KEY"
    },
    {
        "id": "1f511",
        "emoji": "🔑",
        "name": "KEY"
    },
    {
        "id": "1f512",
        "emoji": "🔒",
        "name": "LOCK"
    },
    {
        "id": "1f513",
        "emoji": "🔓",
        "name": "OPEN LOCK"
    },
    {
        "id": "1f514",
        "emoji": "🔔",
        "name": "BELL"
    },
    {
        "id": "1f516",
        "emoji": "🔖",
        "name": "BOOKMARK"
    },
    {
        "id": "1f517",
        "emoji": "🔗",
        "name": "LINK SYMBOL"
    },
    {
        "id": "1f518",
        "emoji": "🔘",
        "name": "RADIO BUTTON"
    },
    {
        "id": "1f519",
        "emoji": "🔙",
        "name": "BACK WITH LEFTWARDS ARROW ABOVE"
    },
    {
        "id": "1f51a",
        "emoji": "🔚",
        "name": "END WITH LEFTWARDS ARROW ABOVE"
    },
    {
        "id": "1f51b",
        "emoji": "🔛",
        "name": "ON WITH EXCLAMATION MARK WITH LEFT RIGHT ARROW ABOVE"
    },
    {
        "id": "1f51c",
        "emoji": "🔜",
        "name": "SOON WITH RIGHTWARDS ARROW ABOVE"
    },
    {
        "id": "1f51d",
        "emoji": "🔝",
        "name": "TOP WITH UPWARDS ARROW ABOVE"
    },
    {
        "id": "1f51e",
        "emoji": "🔞",
        "name": "NO ONE UNDER EIGHTEEN SYMBOL"
    },
    {
        "id": "1f51f",
        "emoji": "🔟",
        "name": "KEYCAP TEN"
    },
    {
        "id": "1f520",
        "emoji": "🔠",
        "name": "INPUT SYMBOL FOR LATIN CAPITAL LETTERS"
    },
    {
        "id": "1f521",
        "emoji": "🔡",
        "name": "INPUT SYMBOL FOR LATIN SMALL LETTERS"
    },
    {
        "id": "1f522",
        "emoji": "🔢",
        "name": "INPUT SYMBOL FOR NUMBERS"
    },
    {
        "id": "1f523",
        "emoji": "🔣",
        "name": "INPUT SYMBOL FOR SYMBOLS"
    },
    {
        "id": "1f524",
        "emoji": "🔤",
        "name": "INPUT SYMBOL FOR LATIN LETTERS"
    },
    {
        "id": "1f525",
        "emoji": "🔥",
        "name": "FIRE"
    },
    {
        "id": "1f526",
        "emoji": "🔦",
        "name": "ELECTRIC TORCH"
    },
    {
        "id": "1f527",
        "emoji": "🔧",
        "name": "WRENCH"
    },
    {
        "id": "1f528",
        "emoji": "🔨",
        "name": "HAMMER"
    },
    {
        "id": "1f529",
        "emoji": "🔩",
        "name": "NUT AND BOLT"
    },
    {
        "id": "1f52a",
        "emoji": "🔪",
        "name": "HOCHO"
    },
    {
        "id": "1f52b",
        "emoji": "🔫",
        "name": "PISTOL"
    },
    {
        "id": "1f52e",
        "emoji": "🔮",
        "name": "CRYSTAL BALL"
    },
    {
        "id": "1f52f",
        "emoji": "🔯",
        "name": "SIX POINTED STAR WITH MIDDLE DOT"
    },
    {
        "id": "1f530",
        "emoji": "🔰",
        "name": "JAPANESE SYMBOL FOR BEGINNER"
    },
    {
        "id": "1f531",
        "emoji": "🔱",
        "name": "TRIDENT EMBLEM"
    },
    {
        "id": "1f532",
        "emoji": "🔲",
        "name": "BLACK SQUARE BUTTON"
    },
    {
        "id": "1f533",
        "emoji": "🔳",
        "name": "WHITE SQUARE BUTTON"
    },
    {
        "id": "1f534",
        "emoji": "🔴",
        "name": "LARGE RED CIRCLE"
    },
    {
        "id": "1f535",
        "emoji": "🔵",
        "name": "LARGE BLUE CIRCLE"
    },
    {
        "id": "1f536",
        "emoji": "🔶",
        "name": "LARGE ORANGE DIAMOND"
    },
    {
        "id": "1f537",
        "emoji": "🔷",
        "name": "LARGE BLUE DIAMOND"
    },
    {
        "id": "1f538",
        "emoji": "🔸",
        "name": "SMALL ORANGE DIAMOND"
    },
    {
        "id": "1f539",
        "emoji": "🔹",
        "name": "SMALL BLUE DIAMOND"
    },
    {
        "id": "1f53a",
        "emoji": "🔺",
        "name": "UP-POINTING RED TRIANGLE"
    },
    {
        "id": "1f53b",
        "emoji": "🔻",
        "name": "DOWN-POINTING RED TRIANGLE"
    },
    {
        "id": "1f53c",
        "emoji": "🔼",
        "name": "UP-POINTING SMALL RED TRIANGLE"
    },
    {
        "id": "1f53d",
        "emoji": "🔽",
        "name": "DOWN-POINTING SMALL RED TRIANGLE"
    },
    {
        "id": "1f550",
        "emoji": "🕐",
        "name": "CLOCK FACE ONE OCLOCK"
    },
    {
        "id": "1f551",
        "emoji": "🕑",
        "name": "CLOCK FACE TWO OCLOCK"
    },
    {
        "id": "1f552",
        "emoji": "🕒",
        "name": "CLOCK FACE THREE OCLOCK"
    },
    {
        "id": "1f553",
        "emoji": "🕓",
        "name": "CLOCK FACE FOUR OCLOCK"
    },
    {
        "id": "1f554",
        "emoji": "🕔",
        "name": "CLOCK FACE FIVE OCLOCK"
    },
    {
        "id": "1f555",
        "emoji": "🕕",
        "name": "CLOCK FACE SIX OCLOCK"
    },
    {
        "id": "1f556",
        "emoji": "🕖",
        "name": "CLOCK FACE SEVEN OCLOCK"
    },
    {
        "id": "1f557",
        "emoji": "🕗",
        "name": "CLOCK FACE EIGHT OCLOCK"
    },
    {
        "id": "1f558",
        "emoji": "🕘",
        "name": "CLOCK FACE NINE OCLOCK"
    },
    {
        "id": "1f559",
        "emoji": "🕙",
        "name": "CLOCK FACE TEN OCLOCK"
    },
    {
        "id": "1f55a",
        "emoji": "🕚",
        "name": "CLOCK FACE ELEVEN OCLOCK"
    },
    {
        "id": "1f55b",
        "emoji": "🕛",
        "name": "CLOCK FACE TWELVE OCLOCK"
    },
    {
        "id": "1f5fb",
        "emoji": "🗻",
        "name": "MOUNT FUJI"
    },
    {
        "id": "1f5fc",
        "emoji": "🗼",
        "name": "TOKYO TOWER"
    },
    {
        "id": "1f5fd",
        "emoji": "🗽",
        "name": "STATUE OF LIBERTY"
    },
    {
        "id": "1f5fe",
        "emoji": "🗾",
        "name": "SILHOUETTE OF JAPAN"
    },
    {
        "id": "1f5ff",
        "emoji": "🗿",
        "name": "MOYAI"
    },
    {
        "emoji": "",
        "name": ""
    },
    {
        "id": "1f600",
        "emoji": "😀",
        "name": "GRINNING FACE"
    },
    {
        "id": "1f607",
        "emoji": "😇",
        "name": "SMILING FACE WITH HALO"
    },
    {
        "id": "1f608",
        "emoji": "😈",
        "name": "SMILING FACE WITH HORNS"
    },
    {
        "id": "1f60e",
        "emoji": "😎",
        "name": "SMILING FACE WITH SUNGLASSES"
    },
    {
        "id": "1f610",
        "emoji": "😐",
        "name": "NEUTRAL FACE"
    },
    {
        "id": "1f611",
        "emoji": "😑",
        "name": "EXPRESSIONLESS FACE"
    },
    {
        "id": "1f615",
        "emoji": "😕",
        "name": "CONFUSED FACE"
    },
    {
        "id": "1f617",
        "emoji": "😗",
        "name": "KISSING FACE"
    },
    {
        "id": "1f619",
        "emoji": "😙",
        "name": "KISSING FACE WITH SMILING EYES"
    },
    {
        "id": "1f61b",
        "emoji": "😛",
        "name": "FACE WITH STUCK-OUT TONGUE"
    },
    {
        "id": "1f61f",
        "emoji": "😟",
        "name": "WORRIED FACE"
    },
    {
        "id": "1f626",
        "emoji": "😦",
        "name": "FROWNING FACE WITH OPEN MOUTH"
    },
    {
        "id": "1f627",
        "emoji": "😧",
        "name": "ANGUISHED FACE"
    },
    {
        "id": "1f62c",
        "emoji": "😬",
        "name": "GRIMACING FACE"
    },
    {
        "id": "1f62e",
        "emoji": "😮",
        "name": "FACE WITH OPEN MOUTH"
    },
    {
        "id": "1f62f",
        "emoji": "😯",
        "name": "HUSHED FACE"
    },
    {
        "id": "1f634",
        "emoji": "😴",
        "name": "SLEEPING FACE"
    },
    {
        "id": "1f636",
        "emoji": "😶",
        "name": "FACE WITHOUT MOUTH"
    },
    {
        "emoji": "",
        "name": ""
    },
    {
        "id": "1f681",
        "emoji": "🚁",
        "name": "HELICOPTER"
    },
    {
        "id": "1f682",
        "emoji": "🚂",
        "name": "STEAM LOCOMOTIVE"
    },
    {
        "id": "1f686",
        "emoji": "🚆",
        "name": "TRAIN"
    },
    {
        "id": "1f688",
        "emoji": "🚈",
        "name": "LIGHT RAIL"
    },
    {
        "id": "1f68a",
        "emoji": "🚊",
        "name": "TRAM"
    },
    {
        "id": "1f68d",
        "emoji": "🚍",
        "name": "ONCOMING BUS"
    },
    {
        "id": "1f68e",
        "emoji": "🚎",
        "name": "TROLLEYBUS"
    },
    {
        "id": "1f690",
        "emoji": "🚐",
        "name": "MINIBUS"
    },
    {
        "id": "1f694",
        "emoji": "🚔",
        "name": "ONCOMING POLICE CAR"
    },
    {
        "id": "1f696",
        "emoji": "🚖",
        "name": "ONCOMING TAXI"
    },
    {
        "id": "1f698",
        "emoji": "🚘",
        "name": "ONCOMING AUTOMOBILE"
    },
    {
        "id": "1f69b",
        "emoji": "🚛",
        "name": "ARTICULATED LORRY"
    },
    {
        "id": "1f69c",
        "emoji": "🚜",
        "name": "TRACTOR"
    },
    {
        "id": "1f69d",
        "emoji": "🚝",
        "name": "MONORAIL"
    },
    {
        "id": "1f69e",
        "emoji": "🚞",
        "name": "MOUNTAIN RAILWAY"
    },
    {
        "id": "1f69f",
        "emoji": "🚟",
        "name": "SUSPENSION RAILWAY"
    },
    {
        "id": "1f6a0",
        "emoji": "🚠",
        "name": "MOUNTAIN CABLEWAY"
    },
    {
        "id": "1f6a1",
        "emoji": "🚡",
        "name": "AERIAL TRAMWAY"
    },
    {
        "id": "1f6a3",
        "emoji": "🚣",
        "name": "ROWBOAT"
    },
    {
        "id": "1f6a6",
        "emoji": "🚦",
        "name": "VERTICAL TRAFFIC LIGHT"
    },
    {
        "id": "1f6ae",
        "emoji": "🚮",
        "name": "PUT LITTER IN ITS PLACE SYMBOL"
    },
    {
        "id": "1f6af",
        "emoji": "🚯",
        "name": "DO NOT LITTER SYMBOL"
    },
    {
        "id": "1f6b0",
        "emoji": "🚰",
        "name": "POTABLE WATER SYMBOL"
    },
    {
        "id": "1f6b1",
        "emoji": "🚱",
        "name": "NON-POTABLE WATER SYMBOL"
    },
    {
        "id": "1f6b3",
        "emoji": "🚳",
        "name": "NO BICYCLES"
    },
    {
        "id": "1f6b4",
        "emoji": "🚴",
        "name": "BICYCLIST"
    },
    {
        "id": "1f6b5",
        "emoji": "🚵",
        "name": "MOUNTAIN BICYCLIST"
    },
    {
        "id": "1f6b7",
        "emoji": "🚷",
        "name": "NO PEDESTRIANS"
    },
    {
        "id": "1f6b8",
        "emoji": "🚸",
        "name": "CHILDREN CROSSING"
    },
    {
        "id": "1f6bf",
        "emoji": "🚿",
        "name": "SHOWER"
    },
    {
        "id": "1f6c1",
        "emoji": "🛁",
        "name": "BATHTUB"
    },
    {
        "id": "1f6c2",
        "emoji": "🛂",
        "name": "PASSPORT CONTROL"
    },
    {
        "id": "1f6c3",
        "emoji": "🛃",
        "name": "CUSTOMS"
    },
    {
        "id": "1f6c4",
        "emoji": "🛄",
        "name": "BAGGAGE CLAIM"
    },
    {
        "id": "1f6c5",
        "emoji": "🛅",
        "name": "LEFT LUGGAGE"
    },
    {
        "emoji": "",
        "name": ""
    },
    {
        "id": "1f30d",
        "emoji": "🌍",
        "name": "EARTH GLOBE EUROPE-AFRICA"
    },
    {
        "id": "1f30e",
        "emoji": "🌎",
        "name": "EARTH GLOBE AMERICAS"
    },
    {
        "id": "1f310",
        "emoji": "🌐",
        "name": "GLOBE WITH MERIDIANS"
    },
    {
        "id": "1f312",
        "emoji": "🌒",
        "name": "WAXING CRESCENT MOON SYMBOL"
    },
    {
        "id": "1f316",
        "emoji": "🌖",
        "name": "WANING GIBBOUS MOON SYMBOL"
    },
    {
        "id": "1f317",
        "emoji": "🌗",
        "name": "LAST QUARTER MOON SYMBOL"
    },
    {
        "id": "1f318",
        "emoji": "🌘",
        "name": "WANING CRESCENT MOON SYMBOL"
    },
    {
        "id": "1f31a",
        "emoji": "🌚",
        "name": "NEW MOON WITH FACE"
    },
    {
        "id": "1f31c",
        "emoji": "🌜",
        "name": "LAST QUARTER MOON WITH FACE"
    },
    {
        "id": "1f31d",
        "emoji": "🌝",
        "name": "FULL MOON WITH FACE"
    },
    {
        "id": "1f31e",
        "emoji": "🌞",
        "name": "SUN WITH FACE"
    },
    {
        "id": "1f332",
        "emoji": "🌲",
        "name": "EVERGREEN TREE"
    },
    {
        "id": "1f333",
        "emoji": "🌳",
        "name": "DECIDUOUS TREE"
    },
    {
        "id": "1f34b",
        "emoji": "🍋",
        "name": "LEMON"
    },
    {
        "id": "1f350",
        "emoji": "🍐",
        "name": "PEAR"
    },
    {
        "id": "1f37c",
        "emoji": "🍼",
        "name": "BABY BOTTLE"
    },
    {
        "id": "1f3c7",
        "emoji": "🏇",
        "name": "HORSE RACING"
    },
    {
        "id": "1f3c9",
        "emoji": "🏉",
        "name": "RUGBY FOOTBALL"
    },
    {
        "id": "1f3e4",
        "emoji": "🏤",
        "name": "EUROPEAN POST OFFICE"
    },
    {
        "id": "1f400",
        "emoji": "🐀",
        "name": "RAT"
    },
    {
        "id": "1f401",
        "emoji": "🐁",
        "name": "MOUSE"
    },
    {
        "id": "1f402",
        "emoji": "🐂",
        "name": "OX"
    },
    {
        "id": "1f403",
        "emoji": "🐃",
        "name": "WATER BUFFALO"
    },
    {
        "id": "1f404",
        "emoji": "🐄",
        "name": "COW"
    },
    {
        "id": "1f405",
        "emoji": "🐅",
        "name": "TIGER"
    },
    {
        "id": "1f406",
        "emoji": "🐆",
        "name": "LEOPARD"
    },
    {
        "id": "1f407",
        "emoji": "🐇",
        "name": "RABBIT"
    },
    {
        "id": "1f408",
        "emoji": "🐈",
        "name": "CAT"
    },
    {
        "id": "1f409",
        "emoji": "🐉",
        "name": "DRAGON"
    },
    {
        "id": "1f40a",
        "emoji": "🐊",
        "name": "CROCODILE"
    },
    {
        "id": "1f40b",
        "emoji": "🐋",
        "name": "WHALE"
    },
    {
        "id": "1f40f",
        "emoji": "🐏",
        "name": "RAM"
    },
    {
        "id": "1f410",
        "emoji": "🐐",
        "name": "GOAT"
    },
    {
        "id": "1f413",
        "emoji": "🐓",
        "name": "ROOSTER"
    },
    {
        "id": "1f415",
        "emoji": "🐕",
        "name": "DOG"
    },
    {
        "id": "1f416",
        "emoji": "🐖",
        "name": "PIG"
    },
    {
        "id": "1f42a",
        "emoji": "🐪",
        "name": "DROMEDARY CAMEL"
    },
    {
        "id": "1f465",
        "emoji": "👥",
        "name": "BUSTS IN SILHOUETTE"
    },
    {
        "id": "1f46c",
        "emoji": "👬",
        "name": "TWO MEN HOLDING HANDS"
    },
    {
        "id": "1f46d",
        "emoji": "👭",
        "name": "TWO WOMEN HOLDING HANDS"
    },
    {
        "id": "1f4ad",
        "emoji": "💭",
        "name": "THOUGHT BALLOON"
    },
    {
        "id": "1f4b6",
        "emoji": "💶",
        "name": "BANKNOTE WITH EURO SIGN"
    },
    {
        "id": "1f4b7",
        "emoji": "💷",
        "name": "BANKNOTE WITH POUND SIGN"
    },
    {
        "id": "1f4ec",
        "emoji": "📬",
        "name": "OPEN MAILBOX WITH RAISED FLAG"
    },
    {
        "id": "1f4ed",
        "emoji": "📭",
        "name": "OPEN MAILBOX WITH LOWERED FLAG"
    },
    {
        "id": "1f4ef",
        "emoji": "📯",
        "name": "POSTAL HORN"
    },
    {
        "id": "1f4f5",
        "emoji": "📵",
        "name": "NO MOBILE PHONES"
    },
    {
        "id": "1f500",
        "emoji": "🔀",
        "name": "TWISTED RIGHTWARDS ARROWS"
    },
    {
        "id": "1f501",
        "emoji": "🔁",
        "name": "CLOCKWISE RIGHTWARDS AND LEFTWARDS OPEN CIRCLE ARROWS"
    },
    {
        "id": "1f502",
        "emoji": "🔂",
        "name": "CLOCKWISE RIGHTWARDS AND LEFTWARDS OPEN CIRCLE ARROWS WITH CIRCLED ONE OVERLAY"
    },
    {
        "id": "1f504",
        "emoji": "🔄",
        "name": "ANTICLOCKWISE DOWNWARDS AND UPWARDS OPEN CIRCLE ARROWS"
    },
    {
        "id": "1f505",
        "emoji": "🔅",
        "name": "LOW BRIGHTNESS SYMBOL"
    },
    {
        "id": "1f506",
        "emoji": "🔆",
        "name": "HIGH BRIGHTNESS SYMBOL"
    },
    {
        "id": "1f507",
        "emoji": "🔇",
        "name": "SPEAKER WITH CANCELLATION STROKE"
    },
    {
        "id": "1f509",
        "emoji": "🔉",
        "name": "SPEAKER WITH ONE SOUND WAVE"
    },
    {
        "id": "1f515",
        "emoji": "🔕",
        "name": "BELL WITH CANCELLATION STROKE"
    },
    {
        "id": "1f52c",
        "emoji": "🔬",
        "name": "MICROSCOPE"
    },
    {
        "id": "1f52d",
        "emoji": "🔭",
        "name": "TELESCOPE"
    },
    {
        "id": "1f55c",
        "emoji": "🕜",
        "name": "CLOCK FACE ONE-THIRTY"
    },
    {
        "id": "1f55d",
        "emoji": "🕝",
        "name": "CLOCK FACE TWO-THIRTY"
    },
    {
        "id": "1f55e",
        "emoji": "🕞",
        "name": "CLOCK FACE THREE-THIRTY"
    },
    {
        "id": "1f55f",
        "emoji": "🕟",
        "name": "CLOCK FACE FOUR-THIRTY"
    },
    {
        "id": "1f560",
        "emoji": "🕠",
        "name": "CLOCK FACE FIVE-THIRTY"
    },
    {
        "id": "1f561",
        "emoji": "🕡",
        "name": "CLOCK FACE SIX-THIRTY"
    },
    {
        "id": "1f562",
        "emoji": "🕢",
        "name": "CLOCK FACE SEVEN-THIRTY"
    },
    {
        "id": "1f563",
        "emoji": "🕣",
        "name": "CLOCK FACE EIGHT-THIRTY"
    },
    {
        "id": "1f564",
        "emoji": "🕤",
        "name": "CLOCK FACE NINE-THIRTY"
    },
    {
        "id": "1f565",
        "emoji": "🕥",
        "name": "CLOCK FACE TEN-THIRTY"
    },
    {
        "id": "1f566",
        "emoji": "🕦",
        "name": "CLOCK FACE ELEVEN-THIRTY"
    },
    {
        "id": "1f567",
        "emoji": "🕧",
        "name": "CLOCK FACE TWELVE-THIRTY"
    }
];
var FileManagerUpload = {
    init: function (maxFileSize, acceptFileTypes, maxNumberOfFiles, popup, inputId, isMulti, cntImgsChecked, translations, fromTinyMce) {
        var selectedFiles = [];
        FileManagerUpload.translations = translations;

        // Initialize the jQuery File Upload widget:
        $('#fileupload').fileupload({
            disableImageResize: false,
            autoUpload: false,
            maxNumberOfFiles: maxNumberOfFiles,
            maxFileSize: maxFileSize,
            acceptFileTypes: acceptFileTypes,
            previewMaxWidth: 121,
            previewMaxHeight: 121,
            previewMinWidth: 120,
            previewMinHeight: 120
            // Uncomment the following to send cross-domain cookies:
            //xhrFields: {withCredentials: true},
        }).bind('fileuploadfinished', function (e, data) {
            if(popup && data.result) {
                var files = data.result.files;

                for (var i=0; i<files.length; i++) {
                    var file = data.result.files[i];
                    var path = file.name;
                    var thumbnail = file.thumbnailUrl;
                    selectedFiles.push( { path: path, thumbnail: thumbnail } );
                }
                var filesSelected = $(".background table tbody.files tr").length;
                if(selectedFiles.length == filesSelected) {
                    parent.FileManagerModal.modalSelectCallback(selectedFiles, inputId, isMulti, fromTinyMce);
                }

            }
        }).bind('fileuploadadded', function (e, data) {
            var filesSelected = $(".background table tbody.files tr").length;
            var filesLimit = maxNumberOfFiles - cntImgsChecked;
            if(maxNumberOfFiles && filesSelected > filesLimit) {
                $(".background table tbody.files tr").slice(filesLimit - filesSelected).remove();
                var limitMessage = FileManagerUpload.translations.upload.limit.message;
                var filesTrans = FileManagerUpload.translations.upload.limit.files;
                alert(limitMessage + maxNumberOfFiles + filesTrans);
            }
        });

        // Load & display existing files:
        $('#fileupload').addClass('fileupload-processing');
        $.ajax({
            // Uncomment the following to send cross-domain cookies:
            //xhrFields: {withCredentials: true},
            url: $('#fileupload').attr("action"),
            dataType: 'json',
            context: $('#fileupload')[0]
        }).always(function () {
            $(this).removeClass('fileupload-processing');
        }).done(function (result) {
            $(this).fileupload('option', 'done')
                .call(this, $.Event('done'), {result: result});
        });
    }
};

var FileManagerBrowse = {
    optionsPlugin: [],
    currentFolder: 0,
    actions: function() {
        // Check all
        $(".checkall").click( function() {
            $('.thumbnail .checkbox').addClass("selectedImg");
            $(".thumbnail").addClass("activeThumb");
            $('.thumbnail .checkedFiles').val('1');

            FileManagerBrowse.refreshActionsActs(FileManagerBrowse.optionsPlugin, true);
        });
        // Uncheck all
        $(".uncheckall").click( function() {
            $('.selectedImg').removeClass('selectedImg').addClass("checkbox");
            $(".activeThumb").removeClass('activeThumb').addClass("thumbnail");
            $('.checkedFiles').val('0');

            FileManagerBrowse.refreshActionsActs(FileManagerBrowse.optionsPlugin, true);
        });
        // Edit name of file/folder
        $(".inputEditName").blur(function() {
            editableText = $(this);
            itemType = editableText.parent().find('.itemType').val();
            itemID = editableText.parent().find('.itemID').val();
            itemName = editableText.val();
            infoText = editableText.parents('.file-manager-item').find('.info_open .text .infoName');
            infoText.text(itemName);
            $.ajax({
                url: GlobalPath + "/file-manager/rename",
                type: "POST",
                data: 'itemType='+itemType+'&itemID='+itemID+'&itemName='+itemName,
                dataType: 'html',
                beforeSend: function() {
                    editableText.prop('disabled', true);
                    editableText.addClass("disableInput");
                },
                complete: function() {
                    editableText.prop('disabled', false);
                    editableText.removeClass("disableInput");
                },
                success: function(response) {
                    if (response == 'error') {
                        editableText.css("border", '1px solid red');
                    }
                    if (itemType == 'folder') {
                        FileManagerBrowse.refreshActionsActs(FileManagerBrowse.optionsPlugin, true);
                    }
                    var successMessage = FileManagerBrowse.translations.messages.success.message;
                    var successTitle = FileManagerBrowse.translations.messages.success.title;
                    showToast(successMessage, successTitle, 'success');
                }
            });
        }).keydown(function(e){
            if (e.keyCode == 13) {
                e.preventDefault();
            }
        });;
        //Search button clicked
        $('#stringSearch').keyup(function(e) {
            e.preventDefault();
            var queryString = $('#stringSearch').val();
            if (!queryString) {
                return $('.file-manager-item').show();
            }
            var inputsThatContainsString = $('.file-manager-item .infoName:contains("'+queryString+'")');
            $('.file-manager-item').hide();
            $(inputsThatContainsString).each(function(input) {
                $(inputsThatContainsString[input]).parents('.file-manager-item').show();
            });
        }).keydown(function(e){
            if (e.keyCode == 13) {
                e.preventDefault();
            }
        });
    },
    listeners: function() {
        // checked or unchecked single (click)
        $(".checkbox").click( function() {
            $(this).toggleClass("selectedImg");
            $(this).parent().parent().toggleClass("activeThumb");

            if ($(this).hasClass("selectedImg")) {
                $(this).parent().find('.checkedFiles').val('1');
            } else {
                $(this).parent().find('.checkedFiles').val('0');
            }
            var isFolder = $(this).parent().find('.itemType').val() == 'folder';
            FileManagerBrowse.refreshActionsActs(FileManagerBrowse.optionsPlugin, isFolder);
        });
        // click open info
        $(".info").click(function(){
            $(this).css('display', 'none');
            $(this).parent().find('.info_btnClose').css('display', 'block');
            $(this).parent().find('.info_open').slideDown();
        });
        // click to close info
        $(".info_btnClose").click(function() {
            var thisPar = this;
            $(this).parent().find('.info_open').slideUp('normal', function(){
                $(thisPar).css('display', 'none');
                $(this).parent().find('.info').css('display', 'block');
            });
        });
        // add to page main button listener
        $('#btnAddToPage').click(function(e) {
            e.preventDefault();
            if ($(this).hasClass('disabled')) {
                return false;
            }
            var selectedItems = $('.thumbnail.file .selectedImg');
            var selectedFiles = [];
            selectedItems.each(function() {
                var options = $(this).parents('.options');
                var path = options.find('.itemPath').val();
                var thumbnail = options.find('.itemThumbnail').val();
                selectedFiles.push( { path: path, thumbnail: thumbnail } );
            });
            parent.FileManagerModal.modalSelectCallback(
                selectedFiles,
                FileManagerBrowse.optionsPlugin.inputId,
                FileManagerBrowse.optionsPlugin.isMulti,
                FileManagerBrowse.optionsPlugin.fromTinyMce
            );
        });
        // Add one file to page
        $('.chooseOneFile button').click(function(e) {
            e.preventDefault();
            var options = $(this).parents('.thumbnail.file').find('.options');
            var path = options.find('.itemPath').val();
            var thumbnail = options.find('.itemThumbnail').val();
            var selectedFiles = [];
            selectedFiles.push( { path: path, thumbnail: thumbnail } );
            parent.FileManagerModal.modalSelectCallback(
                selectedFiles,
                FileManagerBrowse.optionsPlugin.inputId,
                FileManagerBrowse.optionsPlugin.isMulti,
                FileManagerBrowse.optionsPlugin.fromTinyMce
            );
        });
        // Block ui on folder change
        $('.folder.ui-droppable').click(function() { App.blockUI(); });
        // Block ui on form post
        $('.items .background #filesForm').submit(function() { App.blockUI(); });
        // Block ui on adding a new folder
        $('.items .background #filesForm').submit(function() { App.blockUI(); });
        // Bluck ui on clicking top buttons
        $('.modImages .top .buttons a').click(function() { App.blockUI(); });
    },
    init: function(currentFolder, popupOptions, translations) {
        // Modify css contains selector to work case insensitive
        $.expr[":"].contains = $.expr.createPseudo(function(arg) {
            return function( elem ) {
                return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
            };
        });
        FileManagerBrowse.translations = translations;
        FileManagerBrowse.currentFolder = currentFolder;
        FileManagerBrowse.optionsPlugin = popupOptions;
        FileManagerBrowse.listeners();
        FileManagerBrowse.actions();
    },
    showOptions: function(optionsPlugin) {
        var cntImgsChecked = $('.items').find('.selectedImg').length;
        $('#cntImgsChecked span').html(cntImgsChecked);

        if ($('#transferToFolder option').length == 1) {
            $('.moveOption').hide();
        } else {
            $('.moveOption').show();
        }

        if (cntImgsChecked > 0) {
            $('.acts').slideDown();
            $('#cntImgsChecked').fadeIn();
        } else {
            $('.acts').slideUp();
            $('#cntImgsChecked').fadeOut();
        }

        //is from plugin
        cntImgsChecked = optionsPlugin['cntImgsChecked'];
        $('.items_in .thumbnail.activeThumb .options .typeFileIsOk[value="1"]').each(function(){
            cntImgsChecked = cntImgsChecked + 1;
        });
        // update cnt files checked
        if (optionsPlugin['isFromPlugin']) {
            $('#cntImgsChecked2').html(cntImgsChecked);
        }
        // show bottom add to page (if it's stand in requirements and is from plugin files)
        if (optionsPlugin['isFromPlugin'])  {
            var okFileSelected = $('.items_in .thumbnail.activeThumb .options .typeFileIsOk[value="1"]').length;
            var minFilesOk = cntImgsChecked >= optionsPlugin['newMinFiles'];
            var maxFilesOk = cntImgsChecked <= optionsPlugin['newMaxFiles'];
            var checkedFiles = cntImgsChecked > 0;
            if (minFilesOk && maxFilesOk && checkedFiles && okFileSelected) {
                $("#btnAddToPage").removeClass('disabled');
            } else if (optionsPlugin['isMulti']=='false' && cntImgsChecked==1) {
                $("#btnAddToPage").removeClass('disabled');
            } else {
                $("#btnAddToPage").addClass('disabled');
            }
        }
    },
    refreshActionsActs: function(optionsPlugin, folderChecked) {
        var selectedFolders = $('.activeThumb .itemType[value="folder"]');
        var foldersIds = [];
        $(selectedFolders).each(function() {
            foldersIds.push($(this).siblings('.itemID').val());
        });
        if (folderChecked) {
            $.ajax({
                url: GlobalPath + '/file-manager/get-select-options',
                data: { foldersIds: foldersIds, currentFolder: FileManagerBrowse.currentFolder },
                method: 'post',
                beforeSend: function() {
                    App.blockUI();
                },
                success: function(data) {
                    $('#transferToFolder').html(data);
                    if (data.length == 1) {
                        $('.moveOption').hide();
                    } else {
                        $('.moveOption').show();
                    }
                    FileManagerBrowse.showOptions(FileManagerBrowse.optionsPlugin);
                    App.unblockUI()
                },
                error: function() {
                    App.unblockUI()
                }
            });
        } else {
            if ($('.moveOption #transferToFolder option').size()) {
                $('.moveOption').show();
            }
            FileManagerBrowse.showOptions(FileManagerBrowse.optionsPlugin);
        }
    }
};

var FileManagerModal = {
    placeholder: '/../assets/admin/images/placeholder.png',
    init: function() {
        var modal = $('#file-manager-modal');
        FileManagerModal.listeners(modal);
        FileManagerModal.actions();
    },
    uuid: function() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + s4();
    },
    actions: function() {
        $('.tooltips').tooltip();
        $('.files-containers').sortable({
            placeholder: 'ui-state-highlight',
            start: function(e, ui){
                ui.placeholder.height(ui.item.height());
            }
        });
    },
    listeners: function(modal) {
        // File select button
        $(document).on('click', '.fileinput .options .select-file', function() {
            $(this).tooltip('hide');
            var data = $(this).data();
            data = FileManagerModal.cleanData(data);
            var inputId = $(this).parents('.fileinput').data('id');
            data.inputId = inputId;
            var params = $.param(data);
            var url = GlobalPath + '/file-manager?popup=1&' + params;
            modal.find('iframe').attr("src", url);
            $('.tooltips').tooltip();
            FileManagerModal.openModal(modal);
        });
        // Open file button
        $(document).on('click', '.fileinput .options .open-file', function() {
            var file = $(this).attr('data-file');
            if (file) {
                window.open(file, '', 'width=800,height=600');
            }
        });
        // Remove image button
        $(document).on('click', '.fileinput .options .remove-image', function() {
            var fileInput = $(this).parents('.fileinput-new');
            fileInput.find('.file-name-input').val('');
            fileInput.find('.image-input-placeholder').attr('src', GlobalPath + FileManagerModal.placeholder);
            fileInput.find('.open-file').attr('data-file', '');
            fileInput.find('.crop-image').attr('data-image-path', '');
        });
        // Remove image multi button
        $(document).on('click', '.fileinput .options .remove-image-multi', function() {
            var input = $(this).parents('.fileinput');
            input.remove();
        });
        // File select button
        $(document).on('click', '.fileinput .options .upload-file', function() {
            $(this).tooltip('hide');
            var data = $(this).data();
            data = FileManagerModal.cleanData(data);
            var inputId = $(this).parents('.fileinput').data('id');
            data.inputId = inputId;
            var params = $.param(data);
            var url = GlobalPath + '/file-manager/0/upload?popup=1&' + params;
            modal.find('iframe').attr("src", url);
            $('.tooltips').tooltip();
            FileManagerModal.openModal(modal);
        });
        // Crop image button
        $(document).on('click', '.fileinput .options .crop-image', function() {
            var imagePath = $(this).attr('data-image-path');
            var cropName = $(this).data('crop-name');
            var url = GlobalPath + '/file-manager/crop/' + imagePath + '?cropName=' + cropName;
            modal.find('iframe').attr("src", url);
            FileManagerModal.openModal(modal);
        });
        // File multi select button
        $(document).on('click', '.file-multi-container .file-multi-options .select-files', function(e) {
            e.preventDefault();
            var data = $(this).data();
            data = FileManagerModal.cleanData(data);
            var multiFileContainer = $(this).parents('.file-multi-container');
            var inputId = multiFileContainer.data('id');
            data.inputId = inputId;
            var filesCount = multiFileContainer.find('.fileinput-new').length;
            data.filesCount = filesCount;
            var params = $.param(data);
            var url = GlobalPath + '/file-manager?popup=1&' + params;
            modal.find('iframe').attr("src", url);
            FileManagerModal.openModal(modal);
        });
        // File multi clean button
        $(document).on('click', '.file-multi-container .file-multi-options .remove-files', function(e) {
            e.preventDefault();
            var multiFileContainer = $(this).parents('.file-multi-container');
            multiFileContainer.find('.files-containers').empty();
        });
        //File multi upload button
        $(document).on('click', '.file-multi-container .file-multi-options .upload-files', function(e) {
            e.preventDefault();
            var multiFileContainer = $(this).parents('.file-multi-container');
            var inputId = multiFileContainer.data('id');
            var data = $(this).data();
            data = FileManagerModal.cleanData(data);
            data.inputId = inputId;
            var filesCount = multiFileContainer.find('.fileinput-new').length;
            data.filesCount = filesCount;
            var params = $.param(data);
            var url = GlobalPath + '/file-manager/0/upload?popup=1&' + params;
            modal.find('iframe').attr("src", url);
            FileManagerModal.openModal(modal);
        });
    },
    cleanData: function(data) {
        for(var key in data) {
            if(typeof data[key] !== 'string') {
                delete data[key];
            }
            if(typeof data[key] == 'string') {
                data[key] = data[key].replace(/['"]+/g, '');
            }
        }
        return data;
    },
    openModal: function(modal) {
        return modal.modal({show:true});
    },
    modalSelectCallback: function(selectedFiles, element, isMulti, fromTinyMce) {
        $('#file-manager-modal').modal('hide');
        if(isMulti == 'false') {
            if (fromTinyMce) {
                $('#' + element).val( GlobalPublicPath + '/uploads/original/' + selectedFiles[0].path );
                var ed = parent.tinymce.editors[0];
                ed.windowManager.windows[1].close();// CLOSES THE BROWSER WINDOW
            } else {
                var file = selectedFiles[0];
                var inputElement = $('.fileinput[data-id="'+element+'"]');
                inputElement.find('.image-input-placeholder').attr('src', file.thumbnail);
                inputElement.find('.open-file').attr('data-file', GlobalPath + '/../uploads/original/' + file.path);
                inputElement.find('.crop-image').attr('data-image-path', file.path);
                inputElement.find('.file-name-input').val(file.path);
            }
        } else {
            for(var i=0; i<selectedFiles.length; i++) {
                var file = selectedFiles[i];
                console.log($('.file-multi-container[data-id="'+element+'"] #clone_item'));
                var new_file_element = $($('.file-multi-container[data-id="'+element+'"]').siblings('#clone_item').clone().html());
                $(new_file_element).attr('data-id', 'file-manager-' + FileManagerModal.uuid());
                $(new_file_element).find('.open-file').attr('data-file', GlobalPath + '/../uploads/original/' + file.path);
                $(new_file_element).find('.file-name-input').val(file.path);
                $(new_file_element).find('.crop-image').attr('data-image-path', file.path);
                $(new_file_element).find('img.image-input-placeholder').attr('src', file.thumbnail);
                $('.file-multi-container[data-id="'+element+'"]').find('.files-containers').append(new_file_element);
            }
        }
    }
};

var FileManagerHelper = {
    tinyMceInit: function(field_name, url, type, win) {
        var fileManagerUrl = GlobalPath + '/file-manager/?popup=1&allowedExtensions=jpg,jpeg,png,gif&newmaxfiles=1&newminfiles=1&filetype=image&ismulti=false&source=tinymce&inputId=' + field_name;
        tinyMCE.activeEditor.windowManager.open({
            file : fileManagerUrl,
            title : 'ענן הקבצים',
            width : 1024,  // Your dimensions may differ - toy around with them!
            height : 884,
            resizable : "yes",
            inline : "yes",  // This parameter only has an effect if you use the inlinepopups plugin!
            close_previous : "no"
    }, {
            window : win,
                input : field_name
        });
        return false;
    }
};

var reloadModule = function() {

    var showButton = function() {

        var init = function(moduleName) {
            startInterval(moduleName);
            buttonListener();
        };

        var startInterval = function(moduleName) {
            requestButton(moduleName);
            setInterval(function() {
                requestButton(moduleName);
            }, 4000);
        };

        var requestButton = function(moduleName) {
            if (!$('.reload-button-container').length) {
                return false;
            }
            $.ajax({
                url: GlobalPath + '/api/reload-button',
                data: { moduleName: moduleName },
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function(data) {
                    $('.reload-button-container').html(data);
                }
            });
        };

        var buttonListener = function() {
            $(document).on('click', '.reload_module_button',runModuleJob);
        };

        var runModuleJob = function() {
            $(this).attr('disabled', true);
            var  moduleName = $(this).attr('data-module');
            $.ajax({
                url: GlobalPath + '/api/run-module-job',
                data: { moduleName: moduleName },
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                }
            });
        };

        return {
            init: init
        }
    };

    var init = function(moduleName) {
        showButton().init(moduleName);
    };

    return {
        init: init
    }
};


//# sourceMappingURL=custom.js.map
