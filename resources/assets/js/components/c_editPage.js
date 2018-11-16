var pagesGlobals = {
    helpers:      {},
    beforeSubmit: {},
    components: {},
    form: {
        preview:  false
    },
    eventsItems: []
};

var pageManager = function() {

    // Function to replace easily the {data}
    var replacer = function(template, replaceObject) {
        for(var _key in replaceObject) {
            if(!replaceObject.hasOwnProperty(_key))
                continue;

            var regex = new RegExp(_key,"g");
            template = template.replace(regex, replaceObject[_key]);
        }

        return template;
    };

    // For getting a query string param
    var queryString = function (name){
        var url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    };

    // Manages the components inside the plus button
    var plusComponents = function() {
        var selectedSection = '';

        var init = function(plus_selector, info) {

            // Loop through every section and add the plus
            for(var section in info) {
                var sectionDivs = '<div class="components_popup_container" data-section="' + section + '"></div>';
                $('.components_popup_items').append(sectionDivs);
                insertItems(section, info[section]);
            }

            // Open popup
            $(document).on('click.openComponentsPopup', ".plus > a", function(e) {
                selectedSection = $(this).data('id');
                $(".components_popup").addClass('active').animate({
                    top: ($(window).height() / 2) - ($('.components_popup').height() / 2) + 'px'
                }, 300);
                $('.page-header').addClass('overlay');
                $(".components_popup_tabs .nav-tabs li a[data-type='all']").tab('show');
                arrangeItems(selectedSection, 'all');
                initCaseInsensitive();
                e.preventDefault();
            });

            // Close popup
            $(document).on('click.closeComponentsPopup', function(e) {
                if(
                    !$(e.target).parents().hasClass('components_popup') &&
                    !$(e.target).hasClass('components_popup') &&
                    !$(e.target).parents().hasClass('plus') ||
                    $(e.target).hasClass('components_popup_close')
                ) {
                    closePopup();
                    // e.preventDefault();
                }
            });

            // Close popup on escape
            $(document).on('keyup.closeComponentsPopupEsc', function(e) {
                if(e.keyCode == 27)
                    closePopup();
            });

            $(document).on('keyup.searchComponents', '.components_popup .components_popup_search input[type=text]', function(e) {
                var currentVal = $(this).val();
                if( currentVal == '' )
                    arrangeItems(selectedSection, $(".components_popup_tabs .nav-tabs .active a").data('type'));
                else
                    arrangeItems(selectedSection, $(".components_popup_tabs .nav-tabs .active a").data('type'), currentVal);
            });

            // On component item click
            $(document).on('click.addComponent', ".components_popup .component_item", function(e) {
                addComponent(selectedSection, $(this));
                e.preventDefault();
            });

            // On tab change
            $(document).on('shown.bs.tab', '.components_popup_tabs .nav-tabs a[data-toggle="tab"]', function (e) {
                var searchInput = $('.components_popup .components_popup_search input[type=text]').val();
                var key = (searchInput.length) ? searchInput : false;
                arrangeItems(selectedSection, $(this).data('type'), key);
            });
        };

        var initCaseInsensitive = function() {
            // Modify css contains selector to work case insensitive
            $.expr[":"].contains = $.expr.createPseudo(function(arg) {
                return function( elem ) {
                    return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
                };
            });
        };

        // Insert all the items into the view
        var insertItems = function(section, option) {
            var container = $('.components_popup_container[data-section="' + section + '"]');
            for( var comp_type in option.options ) {
                var createDivType = '<div class="components_popup_type_container" data-type="' + comp_type + '"></div>';
                container.append(createDivType);

                var currentDivType = container.find('.components_popup_type_container[data-type="' + comp_type + '"]');

                // Fetching the items from the parent
                for( var components in option.options[comp_type].items ) {
                    var compData = option.options[comp_type].items[components];
                    var splitted_name = '';

                    if(!compData.display_name)
                        return;

                    if(compData.display_name.indexOf(' ')) {
                        var sp_name = compData.display_name.split(' ');
                        splitted_name = String(sp_name[0]).charAt(0) + String(sp_name[1]).charAt(0);
                    } else
                        splitted_name = compData.display_name[0] + compData.display_name[1];

                    var info = "<a href='#' class='component_item' data-type='" + comp_type + "' data-system_name='" + compData.system_name + "' data-cid='" + compData.id + "' data-request='" + compData.request + "'>";
                        info += "<label for='' class='color_" + comp_type + "'>" + splitted_name + "</label><p>";
                        info += "<span>" + compData.display_name + "</span>";
                        info += compData.description + "</p></a>";
                        currentDivType.append(info);
                }
            }
        };

        // Get component data and show in view
        var addComponent = function(sectionID, component) {
            var system_name = component.data('system_name');
            var type        = component.data('type');

            // Prepare the postData
            var postData = {
                request: 'add',
                type: type,
                system_name: system_name
            };

            if(type == 'ready')
                postData.component_id = $(component).data('cid');

            if (queryString('duplicate') !== '1') {
                App.blockUI();
            }
            $.post(GlobalPath + "/pages/" + pageId + "/add-component", postData, function(componentData) {
                var section = $('section.section[data-id="' + sectionID + '"]');

                // Add the component to the header
                loadComponents().addPlusComponent(section, componentData);

                closePopup();

            }).always(function() {
                if (queryString('duplicate') !== '1') {
                    App.unblockUI();
                }
            });
        };

        // Arranging the items between tabs
        var arrangeItems = function(section, type, key) {
            var sectionCon = $('.components_popup_container[data-section="' + section + '"]');
            var Items = (type == 'all') ? sectionCon.find('.component_item') : sectionCon.find('.components_popup_type_container[data-type="' + type + '"] .component_item');
            if(key)
                Items = Items.find('p:contains("' + key + '")');

            var tabContainer = $('.components_popup_items .tab-pane.active');

            tabContainer.html('');
            Items.each(function() {
                if(key)
                    $(this).parent().clone().appendTo(tabContainer);
                else
                    $(this).clone().appendTo(tabContainer);
            });
        };

        var closePopup = function() {
            $(".components_popup").removeClass('active');
            $('.page-header').removeClass('overlay');
        };

        return {
            init: init
        }
    };

    // Loads all the components
    var loadComponents = function() {
        var baseTemplate      = $(".__componentBase").html();
        var tabContainer      = ".pages_navbar";
        var baseContainer     = ".page_components";
        var component_clone   = ".page_component_clone";
        var onLoadComponents  = {};
        var componentsArray   = {};

        var init = function(components) {
            onLoadComponents = components;
            getComponents();
            tabsManager().init();
        };

        // Get all components using ajax
        var getComponents = function() {

            var counter = 0;
            var countAjaxCalls = 0;
            var allAjaxCalls = [];

            App.blockUI();

            if(!Object.keys(onLoadComponents).length)
                done();

            for( var sectionID in onLoadComponents ) {
                if(!onLoadComponents.hasOwnProperty(sectionID))
                    continue;

                counter++;

                var sectionData = onLoadComponents[sectionID];
                var sectionCon = $("section.section[data-id='" + sectionID +"']");

                componentsArray[sectionID] = {};
                var counter2 = 0;

                for(var k in sectionData) {
                    countAjaxCalls++;
                    counter2++;
                    var component = sectionData[k];
                    var randomNumber = random();
                    (function(a, b, c, d, e, f, g, ajaxCalls, ajaxCounter){
                        ajaxCalls[ajaxCounter] = addComponentOnLoad(b, g, a, {
                            success: function(response) {
                                componentsArray[c]['_' + b] = response;
                            },
                            error: function(error) {
                                console.error('error', error);
                            }
                        });
                    })(component, randomNumber, sectionID, counter, counter2, sectionData, sectionCon, allAjaxCalls, countAjaxCalls);
                }

                // Active the first component on the section
                sectionCon.find(baseContainer + " .page_component:first-child").addClass('active_component');
                sectionCon.find(tabContainer  + " .pages_navbar_component:first-child").addClass('active_component');
            }

            $.when.apply(null, allAjaxCalls).then(function() {
                done();
                tabsManager().insertComponents(componentsArray);
            });
        };

        // Insert the component on load
        var addComponentOnLoad = function(vid, sectionCon, component, callback) {
            // Prepare the postData

            var _baseTemplate = baseTemplate;
            var url = GlobalPath + "/pages/" + pageId + "/add-component";

            return $.ajax({
                url: url,
                data: {
                    request: 'get',
                    component_id: component.component_id
                },
                method: "POST"
            })
                .done(function(Retcomponent) {
                    // insert the sites and langs into the data div
                    var sites     = alignCheckboxes(Retcomponent.sites);
                    var languages = alignCheckboxes(Retcomponent.languages);
                    var addclass  = (Retcomponent.options != 'all') ? 'fixed' : '';


                    // Preparing section template
                    var componentView = replacer(_baseTemplate, {
                        '{id}'          : Retcomponent.id,
                        '{sites}'       : sites,
                        '{languages}'   : languages,
                        '{vid}'         : vid,
                        '{name}'        : Retcomponent.display_name,
                        '{system_name}' : Retcomponent.system_name,
                        '{options}'     : Retcomponent.options,
                        '{class}'       : addclass,
                        '{order}'       : component.order
                    });

                    // Preparing component template
                    var componentCloned = replacer(Retcomponent.view, {
                        '__SECTION_ID__'     : sectionCon.data('id'),
                        '__COMPONENT_ID__'   : Retcomponent.id,
                        '__COMPONENT_VID__'  : Retcomponent.id,
                        '__COMPONENT_TYPE__' : Retcomponent.type,
                        '__PAGE_ID__'        : pageId
                    });
                    Retcomponent['order'] = component.order;

                    return callback && callback.success && callback.success({
                        originalData: Retcomponent,
                        order: Retcomponent.options,
                        template: componentView,
                        clone: componentCloned
                    });
                })
                .error(function(error){
                    return callback && callback.error && callback.error(error);
                });
        };

        // Fix the checkboxes ids and make it text
        var alignCheckboxes = function(arrayData) {
            var fixedArrayText = '';
            for( var data in arrayData ) {
                if(!arrayData.hasOwnProperty(data))
                    continue;
                fixedArrayText += arrayData[data].id + ',';
            }
            return fixedArrayText.substring(0, fixedArrayText.length - 1);
        };

        // Insert the component on load
        var addPlusComponent = function(sectionCon, component) {
            var addclass       = (component.options != 'all') ? 'fixed' : '';
            var _componentBase = $(".__componentBase").html();
            var order          = component.order ? component.order : sectionCon.find('.page_component').last().data('order') + 1;

            sectionCon.find(baseContainer).append(replacer(_componentBase, {
                '{id}'          : component.id,
                '{sites}'       : '',
                '{languages}'   : '',
                '{vid}'         : component.id,
                '{name}'        : component.display_name,
                '{system_name}' : component.system_name,
                '{options}'     : component.options,
                '{class}'       : addclass,
                '{order}'       : component.order
            }));

            // component inside data
            var componentCloned = replacer(component.view, {
                '__SECTION_ID__'   : sectionCon.data('id'),
                '__COMPONENT_ID__' : component.id,
                '__COMPONENT_VID__': component.id,
                '__PAGE_ID__'      : pageId
            });
            sectionCon.find(".page_component[data-viewid='" + component.id + "'] " + component_clone).html(componentCloned);
            tabsManager().sortComponent(sectionCon, component.id, component.options);

            initSettings().init(component.id);
            events().fire('new_component_added');
            initSitesLangs().appendOne({
                component_con: '.page_component[data-viewid="' + component.id + '"]',
                main_sites: '.pages_main_sites',
                sites_temp: '.__websites',
                langs_temp: '.__langs'
            });
        };

        // Runs this function when all is done
        var done = function() {

            if (queryString('duplicate') !== '1') {
                App.unblockUI();
            }

            // Order the tabs
            tabsManager().sortTabs();
        };

        // Random function for random number
        var random = function() {
            return Math.floor(Math.random() * 1000000000) + 1;
        };

        return {
            init: init,
            addPlusComponent: addPlusComponent
        }
    };

    // Tabs manager
    var tabsManager = function() {

        var page_components = ".page_components";
        var slideInProcess = false;

        var init = function() {
            // Listen to delete component click
            $(document).on("click.deleteComponent", ".page_component_buttons .page_component_delete", function(e) {
                events().fire('deleted');
                var vid = $(this).parents('.page_component').data('viewid');
                $('.page_component[data-viewid="' + vid + '"]').remove();
                e.preventDefault();
            });

            // listen for Languages click
            $(document).on('click.componentLanguage', ".page_component_languages", function() {
                var toggle_div = $(this).parents('.page_component').find('.page_component_languages');

                toggleLanguages(toggle_div);
            });

            $(document).on('click.componentName', ".page_component_name", function() {
                var toggle_div_id = $(this).parents('.page_component').data('id');
                toggleByName(toggle_div_id);
            });

            // listen for Settings change
            $(document).on('click.componentSettings', ".page_component_settings:not(.disabled)", function() {
                var toggle_div = $(this).parents('.page_component').find('.page_component_languages');
                toggleSettings(toggle_div);
            });

            // On tab change
            $(document).on('shown.bs.tab', '.page_component_languages_tab li a[data-toggle="tab"]', function (e) {
                var langID = $(this).parent().data('id');
                var langs  = $(this).parents('.page_component_clone').find('.cData .langs');
                var langItems = $(this).parents('.page_component').find('.page_component_clone .langs .langItem[data-lang="' + langID + '"]');

                if( langItems.length <= 0 ) {
                    // Create new clone
                    var componentContainer = $(this).parents('.page_component');
                    initSitesLangs().createLangComponentClone(langID, componentContainer);
                }
                else {
                    langs.find('.langItem').removeClass('active');
                    langItems.addClass('active');
                }

                if($(this).parents('.page_component').find('.noLangs').hasClass('active')) {
                    langs.find('.langItem').removeClass('active');
                }
            });
        };

        // Toggle Between Settings And Languages Inside Component
        var toggleLanguages = function(elem) {
            var page_compo = $(elem).parents('.page_component');
            var openLangs  = !(page_compo.find(".page_component_languages").hasClass('active'));

            if(page_compo.find('.page_component_settings').hasClass('active')) {
                closeSettings(page_compo, function() {
                    page_compo.find(".noLangs, .page_component_languages_tab").removeClass('notInTab');
                    openLanguages(page_compo);
                });
            }
            else {
                if (openLangs) {
                    page_compo.find(".noLangs, .page_component_languages_tab").removeClass('notInTab');
                    openLanguages(page_compo);
                }
                else {
                    closeLanguages(page_compo);
                }
            }
        };

        // Toggle by component name
        var toggleByName = function(comp_id) {
            var page_compo = $('.page_component[data-id="' + comp_id + '"]');
            if(page_compo.find('.page_component_languages').hasClass('active')) {
                closeLanguages(page_compo);
            }
            else if(page_compo.find('.page_component_settings').hasClass('active')) {
                closeSettings(page_compo);
            }
            else {
                if(page_compo.find('.noLangs').hasClass('active')) {
                    page_compo.find(".noLangs, .page_component_languages_tab").addClass('notInTab');
                    openSettings(page_compo);
                }
                else {
                    page_compo.find(".noLangs, .page_component_languages_tab").removeClass('notInTab');
                    openLanguages(page_compo);
                }
            }
        };

        // Toggle Between Settings And Languages Inside Component
        var toggleSettings = function(elem) {
            var page_compo   = $(elem).parents('.page_component');
            var openSett     = !(page_compo.find(".page_component_settings").hasClass('active'));

            if(page_compo.find('.page_component_languages').hasClass('active')) {
                closeLanguages(page_compo, function() {
                    page_compo.find(".noLangs, .page_component_languages_tab").addClass('notInTab');
                    openSettings(page_compo);
                });
            }
            else {
                if(openSett) {
                    page_compo.find(".noLangs, .page_component_languages_tab").addClass('notInTab');
                    openSettings(page_compo);
                }
                else {
                    closeSettings(page_compo);
                }
            }
        };

        // Open Settings Inside Component
        var openSettings = function(page_compo, callback) {
            if(slideInProcess) return;
            slideInProcess = true;
            page_compo.addClass('opened');
            page_compo.find('.page_component_settings').toggleClass('active');
            page_compo.find(".cData .settings").addClass('active');
            page_compo.find('.page_component_clone').slideDown('normal', function() {
                slideInProcess = false;
                (callback && callback()) ? callback() : '';
            });
        };

        // Close Settings Inside Component
        var closeSettings = function(page_compo, callback) {
            if(slideInProcess) return;
            slideInProcess = true;
            page_compo.removeClass('opened');
            page_compo.find('.page_component_settings').toggleClass('active');
            page_compo.find('.page_component_clone').slideUp('normal', function() {
                page_compo.find(".cData .langs").removeClass('active');
                page_compo.find(".cData .settings").removeClass('active');
                slideInProcess = false;
                (callback && callback()) ? callback() : '';
            });
        };

        // Open Languages Inside Component
        var openLanguages = function(page_compo, callback) {
            if(slideInProcess) return;
            slideInProcess = true;
            page_compo.addClass('opened');
            page_compo.find('.page_component_languages').toggleClass('active');
            page_compo.find(".cData .langs").addClass('active');
            page_compo.find(".page_component_languages_tab .nav.nav-tabs li.show").first().find('a').tab('show');
            page_compo.find(".page_component_languages_tab .langItem:first-child").addClass('langItem');
            page_compo.find('.page_component_clone').slideDown('normal', function() {
                slideInProcess = false;
                (callback && callback()) ? callback() : '';
            });
        };

        // Close Languages Inside Component
        var closeLanguages = function(page_compo, callback) {
            if(slideInProcess) return;
            slideInProcess = true;
            page_compo.removeClass('opened');
            page_compo.find('.page_component_languages').toggleClass('active');
            page_compo.find('.page_component_clone').slideUp('normal', function() {
                page_compo.find(".cData .langs").removeClass('active');
                page_compo.find(".cData .settings").removeClass('active');
                slideInProcess = false;
                (callback && callback()) ? callback() : '';
            });
        };

        // Sorts the component when added by plus
        var sortComponent = function(sectionCon, id, options) {
            // sectionCon.find(".page_component[data-viewid='" + component.id + "'] " + component_clone
            var component = sectionCon.find(".page_component[data-viewid='" + id + "']");

            if( !!options && options != 'all' ) {
                switch(options) {
                    case 'first':
                        component.prependTo(sectionCon.find(page_components));
                        break;

                    case 'last':
                        component.appendTo(sectionCon.find(page_components));
                        break;

                    default:
                        if( $(page_components + ' .page_component:nth-child(' + (options - 1) + ')').length ) {
                            sectionCon.find(page_components + ' .page_component:nth-child(' + (options - 1) + ')').after(component);
                        }
                        else
                            component.appendTo(sectionCon.find(page_components));
                }
            }
            else {
                if( sectionCon.find(page_components + ' .page_component[data-options="last"]').length ) {
                    var index = sectionCon.find(page_components + ' .page_component[data-options="last"]').index();
                    sectionCon.find(page_components + ' .page_component:nth-child(' + (index) + ')').after(component);
                }
                else {
                    component.appendTo(sectionCon.find(page_components));
                }
            }
        };

        // Sort the tabs before inserting
        var sortTabs = function() {
            (function() {
                $('.page_components').sortable({
                    items: '> :not(.fixed)',
                    handle: ".page_component_buttons > i",
                    placeholder: "page_component_placeholder",
                    start: function(event, ui) {
                        var start_pos = ui.item.index();
                        ui.item.data('start_pos', start_pos);

                        $('.fixed', this).each(function(){
                            var $this = $(this);
                            $this.data('pos', $this.index());
                        });
                    },
                    change: function(event, ui) {
                        /*$sortable = $(this);
                        $statics = $('.fixed', this).detach();
                        $helper = $('<div></div>').prependTo(this);
                        $statics.each(function () {
                            var $this = $(this);
                            var target = $this.data('pos');

                            $this.insertAfter($('div', $sortable).eq(target));
                        });
                        $helper.remove();*/
                    },
                });
            })();
        };

        var insertComponents = function(components) {
            for( var k1 in components ) {
                var section = components[k1];
                var ordered = {};

                var orderedArray = Object.keys(section).sort(function(a,b) {
                    return section[a].originalData.order - section[b].originalData.order;
                });

                (function(arr) {
                    arr.forEach(function (obj) {
                        ordered[obj] = section[obj];
                    });

                    for (var k2 in ordered) {
                        var component = section[k2];
                        $('section[data-id="' + k1 + '"] .page_components').append(component.template);
                        $('section[data-id="' + k1 + '"] .page_components .page_component[data-id="' + component.originalData.id + '"] .page_component_clone').append(component.clone);
                        initSettings().init(component.originalData.id);
                    }
                })(orderedArray);
            }

            initSitesLangs().init();
        };

        return {
            init: init,
            sortComponent: sortComponent,
            sortTabs: sortTabs,
            insertComponents: insertComponents
        }
    };

    // Sites and langs select in the components
    var initSitesLangs = function() {
        var component_con    = '.page_component';
        var langs_temp       = '.__langs';

        var init = function() {
            // call the append to the components
            append();

            $(document).on('change.mainSites', ".pages_main_sites input[type=checkbox]", function() {
                changeAllSites($(this));
            });

            // enable the sites on the component
            $('.pages_main_sites input[type=checkbox]:checked').each(function() {
                var site_id = $(this).data('id');

                $('.mt-site-checkbox [name*="[global][sites][' + site_id + ']"]').prop({
                    disabled: false,
                    // checked: false
                }).parents('.mt-site-checkbox').removeClass('disabled');
            });

        };

        // Append sites and lang
        var append = function() {
            $(component_con).each( function() {
                // If exists dont append
                if($(this).find('.page_component_languages_tab').length > 0)
                    return;

                var id = $(this).data('id');
                var sites = (~String($(this).data('sites')).indexOf(',')) ? String($(this).data('sites')).split(',') : String($(this).data('sites'));
                var languages = (~String($(this).data('languages')).indexOf(',')) ? String($(this).data('languages')).split(',') : String($(this).data('languages'));
                var currentCon = ".page_component[data-id=" + id + "] .settings";

                $(this).find('.page_component_clone').prepend(replacer($(langs_temp).html(), {
                    '{vid}'  : id
                }));

                $(document).on('change.data' + id, currentCon + " .websites input[type=checkbox]", function() {
                    onSiteChange(id);
                });

                $(document).on('change.data' + id, currentCon + " .languages input[type=checkbox]", function() {
                    onLangChange(id);
                });

                $(this).find('.settings .websites input[type=checkbox]').each( function() {
                    if( $(this).data('id') == sites || typeof(sites) == 'object' && sites.indexOf(String($(this).data('id'))) !== -1 ) {
                        $(this).prop({
                            disabled: false,
                            checked: true
                        });
                        onSiteChange(id);
                    }
                });

                $(this).find('.settings .languages input[type=checkbox]').each( function() {
                    if( $(this).data('id') == languages || typeof(languages) == 'object' && languages.indexOf(String($(this).data('id'))) !== -1 ) {
                        $(this).prop({
                            disabled: false,
                            checked: true
                        });
                        onLangChange(id);
                    }
                });

                onSiteChange(id);
                cHelper().run(id);
            });
        };

        var changeAllSites = function(input) {
            var name = input.prop('name');
            var checked = input.prop('checked');

            // go through every sites select in the components
            $('.mt-site-checkbox').each( function() {
                var myLabel = $(this).find('input[name*="' + name + '"]').parents('.mt-site-checkbox');
                var myInput = $(this).find('input[name*="' + name + '"]');

                if(checked) {
                    var checkedAlreadyData = myInput.data('wasChecked');
                    myLabel.addClass('active').removeClass('disabled');
                    myInput.prop({
                        disabled: false,
                        checked: checkedAlreadyData
                    });
                    myInput.data('wasChecked', '');
                }
                else {
                    var checkedAlready = myInput.prop('checked');
                    if(checkedAlready)
                        myInput.data('wasChecked', 'true');

                    myLabel.removeClass('active').addClass('disabled');
                    myInput.prop({
                        disabled: true,
                        checked: false
                    });
                }

                onSiteChange($(this).parents('.page_component').data('id'));
            });
        };

        var onSiteChange = function(id) {
            var site_con = $(".page_component[data-id='" + id + "'] .settings .websites");
            var lang_con = $(".page_component[data-id='" + id + "'] .settings .languages");
            var active_sites = [];

            // clean the active langs
            $(".page_component[data-id='" + id + "'] .noLangs").addClass('active');
            $(".page_component[data-id='" + id + "'] .langItem").removeClass('active');
            $(".page_component[data-id='" + id + "'] .page_component_languages_tab").removeClass('active');

            lang_con.find('.mt-lang-checkbox').each(function() {
                var myInput        = $(this).find('input[type=checkbox]');
                var checkedAlready = myInput.prop('checked');
                if(checkedAlready)
                    myInput.data('wasChecked', 'true');

                $(this).removeClass('active').addClass('disabled');
                myInput.prop({
                    disabled: true,
                    checked: false
                });

                $(".page_component[data-id='" + id + "'] .page_component_languages_tab li[data-id='" + myInput.data('id') + "']").removeClass('show').addClass('hide');
            });

            // insert the active sites into an array
            site_con.find('.mt-site-checkbox input[type=checkbox]:checked').each( function() {
                var site_id = $(this).data('id');
                active_sites.push(String(site_id));
            });

            // go to each checkbox and check if the selected sites contains it
            lang_con.find('.mt-lang-checkbox').each( function() {
                var cbox               = $(this).find("input[type=checkbox]");
                var lang_id            = cbox.data('id');
                var checkedAlreadyData = cbox.data('wasChecked');
                var sites              = String(cbox.data('belong'));

                // if its more than one sites
                if( sites.indexOf(',') != -1 ) {
                    var site_ids = sites.split(',');
                    // loop through the sites and check if the lang contains an active site
                    for(var site_count = 0; site_count < site_ids.length; site_count++) {
                        if( $.inArray(String(site_ids[site_count]), active_sites) != -1 ) {
                            handleLanguage(cbox, checkedAlreadyData, id, lang_id);
                        }
                    }
                }
                else {
                    if( $.inArray(String(sites), active_sites) != -1 ) {
                        handleLanguage(cbox, checkedAlreadyData, id, lang_id);
                    }
                }
            });
        };

        var handleLanguage = function(cbox, checkedAlreadyData, id, lang_id) {
            cbox.data('wasChecked', '');
            cbox.parents('.mt-lang-checkbox').removeClass('disabled').addClass('active');
            $(".page_component[data-id='" + id + "'] .noLangs").removeClass('active');
            $(".page_component[data-id='" + id + "'] .langItem:first-child").addClass('active');
            $(".page_component[data-id='" + id + "'] .page_component_languages_tab").addClass('active');
            $(".page_component[data-id='" + id + "'] .page_component_languages_tab li[data-id='" + lang_id + "']").removeClass('hide');
            cbox.prop({
                disabled: false,
                checked: checkedAlreadyData
            });
            onLangChange(id);
        };

        var onLangChange = function(id) {
            var page_compo = $('.page_component[data-id="' + id + '"]');
            page_compo.find('.settings .languages input[type=checkbox]').each(function() {
                var lang_id = $(this).data('id');
                var checked = $(this).prop('checked');

                if(checked)
                    page_compo.find('.page_component_languages_tab li[data-id="' + lang_id + '"]').addClass('show');
                else
                    page_compo.find('.page_component_languages_tab li[data-id="' + lang_id + '"]').removeClass('show');
            });
        };

        // The creation function
        var createLangComponentClone = function(langID, page_component) {
            var id        = page_component.data('id');
            var vid       = page_component.data('viewid');
            var htmlClone = page_component.find('.clone').html();
            var Clone     = replacer(htmlClone, {
                '__LANG_ID__'  : langID,
                '__COMPONENT_VID__'  : vid
            });
            page_component.find('.page_component_clone .langs').append(Clone);
            page_component.find('.page_component_clone .langs .langItem').removeClass('active');
            page_component.find('.page_component_clone .langs .langItem[data-lang="' + langID + '"]').addClass('active');
            cHelper().run(id);
        };

        // Updates the sites that checked
        var updateNewSites = function() {
            $(".pages_main_sites input[type=checkbox]:checked").each( function() {
                var input_name = $(this).prop('name');
                $(".page_component .mt-site-checkbox input[name*='" + input_name + "']").prop('disabled', false).parents('.mt-site-checkbox').removeClass('disabled').addClass('active');
            });
        };

        return {
            init: init,
            onSiteChange: onSiteChange,
            onLangChange: onLangChange,
            updateNewSites: updateNewSites,
            createLangComponentClone: createLangComponentClone,
            appendOne: function() {
                append();
                updateNewSites();
            }
        }
    };

    // Global settings
    var initSettings = function() {

        var settings_temp = $('.__settings').html();

        var init = function(comp_id) {
            $('.page_component[data-id="' + comp_id + '"] .settings').prepend(replacer(settings_temp, {
                '__COMPONENT_VID__'  : comp_id
            }));

            initSitesLangs().updateNewSites();
            initSitesLangs().onSiteChange(comp_id);
            initSitesLangs().onLangChange(comp_id);
        };

        var initOnce = function() {
            $(document).on('change', '.page_settings_main_page input[type=radio]', function() {
                if($(this).val() == '1') {
                    $('.page_settings_children').addClass('active');
                }
                else {
                    $('.page_settings_children').removeClass('active');
                }
            });

            $(document).on('change', '.active_site_cbox input[type=checkbox]', function() {
                var id = $(this).data('id');
                var elem = $('input[name="defaultSites[' + id + ']"]').prop('checked', false).parents('label');

                if($(this).prop('checked'))
                    elem.removeClass('hide');
                else
                    elem.addClass('hide');
            });
        };

        return {
            init: init,
            initOnce: initOnce
        }
    };

    // Form Helper
    var FormHelper = function() {

        // Main init of the form
        var init =  function() {
            // Disable the form submit
            $('form').on('submit', function( event ) {
                event.preventDefault();
            });
            // Add listener to submit buttons
            $('button[type="submit"]#previewButton').on('click', function( event ) {
                event.preventDefault();
                pagesGlobals.form.preview = true;
                $('input[name="preview"]').val(1);
                $('input[name="duplicate"]').val(0);
                submit($(this).parents('form'));
            });
            $('button[type="submit"]#submitButton').on('click', function( event ) {
                event.preventDefault();
                pagesGlobals.form.preview = false;
                $('input[name="preview"]').val(0);
                $('input[name="duplicate"]').val(0);
                submit($(this).parents('form'));
            });
            // Add listener to submit buttons
            $('button[type="submit"]#duplicateButton').on('click', function( event ) {
                event.preventDefault();
                pagesGlobals.form.duplicate = true;
                $('input[name="preview"]').val(0);
                $('input[name="duplicate"]').val(1);
                submit($('.main_form'));
            });

            // Handling duplication
            if (queryString('duplicate') == '1') {
                App.blockUI({
                    message: 'משכפל דף...'
                });
                setTimeout(function() {
                    $('button[type="submit"]#duplicateButton').click();
                }, 4000);
            }
        };

        // Object that contains functions for preparing and submitting the main form
        var submit = function(form) {
            var formUrl  = $(form).prop('action');
            var IDs = cHelper().beforeSubmit.getSites($(".pages_main_sites"));

            constantBeforeSubmit();
            beforeSubmit();

            var formData = $(form).serialize();
            formData = formData + "&sites=" + IDs;

            App.blockUI();
            $.post({
                url: formUrl,
                method: 'POST',
                data: formData,
                success: function(data) {

                    if (data.pageId) {
                        location.replace(GlobalPath + '/pages/'+data.pageId+'/edit');
                    }

                    if(pagesGlobals.form.preview)
                        console.log('Go to url');
                        //window.open('http://www.google.com/');
                    else
                        showToast('הפרטים נשמרו בהצלחה', 'הודעה', 'success');

                    Errors().clearErrors();
                    Errors().clearGlobalErrors();
                    refreshLanguages(data.languages);
                    App.unblockUI();
                },
                error: function(errors) {
                    showToast('ישנה שגיאה בעמוד','שגיאה!', 'error');
                    Errors().handle(errors.responseJSON.errors);
                    App.unblockUI();
                }
            });
        };

        var refreshLanguages = function(languages) {
            $('.page_links_list').empty();
            for (var language in languages) {
                var item = '<li role="presentation">' +
                    '<a role="menuitem" tabindex="-1" target="_blank" href="'+languages[language]+'">' +
                    '<i class="fa fa-globe" aria-hidden="true"></i>' +
                    language +
                    '</a>' +
                    '</li>';
                $('.page_links_list').append(item);
            }
        };

        var beforeSubmit = function() {
            for( var component in pagesGlobals.beforeSubmit ) {
                pagesGlobals.beforeSubmit[component] && pagesGlobals.beforeSubmit[component]();
            }
        };

        var constantBeforeSubmit = function() {
            $('.page_component .settings').each(function() {
                var container = $(this);
                var sites = cHelper().beforeSubmit.getSites(container.find('.websites'));
                container.parents('.page_component').find('.cData input[name*="[form_data][global][sites]"]').val(sites);

                var languages = cHelper().beforeSubmit.getLanguages(container.find('.languages'));
                container.parents('.page_component').find('.cData input[name*="[form_data][global][languages]"]').val(languages);
            });
        };

        return {
            init: init
        }
    };

    // Init components class
    var cHelper = function() {

        var helpers = {
            tinyMCE: function(elemClass, menu) {
                menu = (!menu) ? false : menu;
                tinymce.init({
                    selector: elemClass,
                    menubar: menu
                });
                return tinymce.init({ selector: elemClass });
            }
        };

        var beforeSubmit = {
            tinyMCE: function(id) {
                return tinymce.get(id).getContent();
            },

            getSites: function(sites_container) {
                var IDs = '';
                sites_container.find('input[type=checkbox]:checked').each(function() {
                    var name = $(this).prop('name');
                    name = name.split('[sites]')[1];
                    name = name.replace('[', '');
                    name = name.replace(']', '');
                    IDs += name + ',';
                });
                return "[" + IDs.substring(0, IDs.length - 1) + "]";
            },

            getLanguages: function(languages_container) {
                var IDs = '';
                languages_container.find('input[type=checkbox]:checked').each(function() {
                    var name = $(this).prop('name');
                    name = name.split('[languages]')[1];
                    name = name.replace('[', '');
                    name = name.replace(']', '');
                    IDs += name + ',';
                });
                return "[" + IDs.substring(0, IDs.length - 1) + "]";
            }
        };

        var registerHelper = function(name, closure) {
            pagesGlobals.helpers[name] = closure;
        };

        var register = function(elemViewID, closure) {
            pagesGlobals.components[elemViewID] = closure;
        };

        var registerSubmit = function(elemViewID, closure) {
            pagesGlobals.beforeSubmit[elemViewID] = closure;
        };

        var run = function(vID){
            return pagesGlobals.components['component' + vID] && pagesGlobals.components['component' + vID]();
        };

        return {
            registerHelper: registerHelper,
            register: register,
            run: run,
            helpers: helpers,
            beforeSubmit: beforeSubmit,
            registerSubmit: registerSubmit
        }
    };

    // Handling Errors
    var Errors = function() {
        var handle = function(json) {
            clearErrors();
            clearGlobalErrors();

            // Components Errors
            for( var componentID in json.components ) {
                var componentData = json.components[componentID];
                appendIcon(componentID);

                var errorLength = 0;
                returnComponent(componentID).find('.page_component_languages .badge').text(errorLength);
                for( var information in componentData ) {
                    if(information.indexOf('.global.') === -1)
                        errorLength++;
                    var data = componentData[information];
                    appendText(componentID, data, retrieveLang(information));
                }
                returnComponent(componentID).find('.page_component_languages .badge').text(errorLength);
                divErrors(componentID);
            }
            // Global Errors
            for( var field in json.global) {
                addGlobalError(json.global, field);
            }
        };

        var addGlobalError = function(errors, field) {
            showErrorsMessage(errors[field]);
        };

        var clearGlobalErrors = function() {
            $('#global_errors_container').remove();
        };

        var showErrorsMessage = function(errorMessage) {
            var errorsContainers = $('#global_errors_container');
            if (!errorsContainers.length) {
                var errorsContainers = '<div id="global_errors_container" class="alert alert-danger fade in">'+
                    '<button type="button" class="close" data-dismiss="alert" aria-hidden="true"></button>'+
                    '<ul></ul>'+
                    '</div>';
                $('.page-bar').after(errorsContainers);
            }
            var errorMessageElement = '<li>'+errorMessage+'</li>';
            $('#global_errors_container ul').append(errorMessageElement);
        };

        var returnTab = function(id) {
            return $('.page_component[data-id="' + id + '"] .page_component_name');
        };

        var appendText = function(id, text, langID) {
            if( langID ) {
                // Inside Languages
                returnComponent(id)
                    .find('.langItem[data-lang="' + langID + '"] .component_errors ul')
                    .append('<li>' + text + '</li>');
            }
            else {
                // Settings
                returnComponent(id)
                    .find('.settings .settings_errors ul')
                    .append('<li>' + text + '</li>');
            }
        };

        var returnComponent = function(id) {
            return $('.page_component[data-id="' + id + '"]');
        };

        var divErrors = function(id) {
            var component = returnComponent(id);
            // if there is language errors
            var showLanguageErrors = false;
            component.find('.component_errors').each( function() {
                if( $(this).find('li').length > 0 ) {
                    showLanguageErrors = true;
                    $(this).addClass('active');
                }
                else {
                    $(this).removeClass('active');
                }
            });

            if (showLanguageErrors && !component.find('.noLangs').hasClass('active'))
                component.find('.page_component_languages .badge').addClass('active');
            else if (showLanguageErrors && component.find('.noLangs').hasClass('active'))
                component.find('.page_component_languages .badge').addClass('active').text(1);
            else
                component.find('.page_component_languages .badge').removeClass('active');

            // for settings errors
            if( component.find('.settings_errors li').length > 0 ) {
                component.find('.settings_errors').addClass('active');
                component.find('.page_component_settings .badge').text(component.find('.settings_errors li').length).addClass('active');
            }
            else {
                component.find('.settings_errors').removeClass('active');
                $(this).parents('.page_component').find('.page_component_settings .badge').removeClass('active').text('');
            }
        };

        var appendIcon = function(id) {
            var icon = '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i>';
            returnTab(id).prepend(icon);
        };

        var clearErrors = function() {
            $('.page_component_name i.fa-exclamation-triangle').remove();

            $('.component_errors').removeClass('active');
            $('.component_errors ul li').remove();
            $('.page_component_languages .badge').removeClass('active').text('');

            $('.settings_errors').removeClass('active');
            $('.settings_errors ul li').remove();
            $('.page_component_settings .badge').removeClass('active').text('');
        };

        var retrieveLang = function(input) {
            var regex = /languages\.(\d+?)\./;
            var matchLanguages = /form_data\.languages/;
            var langID = input.match(regex);

            if( input.match(matchLanguages) && langID.length > 0 ) {
                return langID[1];
            }
            else
                return false;
        };

        return {
            handle: handle,
            clearErrors: clearErrors,
            clearGlobalErrors: clearGlobalErrors,
        }
    };

    var events = function() {
        var items = pagesGlobals.eventsItems;
        return {
            listen: function(key, callback) {
                if(!items[key]) {
                    items[key] = [];
                }
                items[key].push(callback);
            },
            fire: function (key, params){
                if(items[key]) {
                    for(var k in items[key]) {
                        var callback = items[key][k];
                        callback && callback(params);
                    }
                }
            }
        }
    };

    // init Function
    var init = function(availableComponents, pageComponents) {
        plusComponents().init(".__plus", availableComponents);
        loadComponents().init(pageComponents);
        FormHelper().init();
        initSettings().initOnce();
    };

    return {
        init: init,
        cHelper: cHelper,
        events: events
    }
};