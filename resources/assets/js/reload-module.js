
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

