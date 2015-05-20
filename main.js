(function($) {
    'use strict';

    var MONITOR_URL = "https://api.uptimerobot.com/getMonitors?apiKey={{API_KEY}}&format=json&noJsonCallback=1&customUptimeRatio=1-7-30-365";
    var services = [
        { id: 'website', api_key: 'm775987346-0a1e273dee99341047fe7279' },
        { id: 'clean',   api_key: 'm776633537-961322d46b6bf23ce39b448c' },
        { id: 'suggest-premium', api_key: 'm776052778-75e9b3d8f3162b108fc7b1bf' }
        
    ];

    function parse_state(monitor) {
        return monitor.status === '2'; 
    }

    function parse_uptime(monitor) {
        var uptime = {},
            uptimes = monitor.customuptimeratio.split('-');
        uptime.day = uptimes[0];
        uptime.week = uptimes[1];
        uptime.month = uptimes[2];
        uptime.year = uptimes[3];
        return uptime;
    }
    
    function get_service_info(service) {
        var promise = $.Deferred();
        $.get(MONITOR_URL.replace('{{API_KEY}}', service.api_key))
        .done(function(response) {
            var monitor = response.monitors 
                && response.monitors.monitor
                && response.monitors.monitor.length && response.monitors.monitor[0] || null;
            if (!monitor) {
                promise.reject();    
            } else {
                service.is_up = parse_state(monitor);
                service.uptime = parse_uptime(monitor);
                console.log(service);
                promise.resolve(service);    
            }
            
        })
        .fail(function() {
            promise.reject();
        });
        return promise;
    }

    function render_logo($el, is_up) {
        $el.removeClass('hidden green red');
        if (is_up) {
            $el.addClass('fa-check green');
        } else {
            $el.addClass('fa-ban red');
        }
    }

    function render_state($el, is_up) {
        $el.removeClass('undefined green red');
        if (is_up) {
            $el.addClass('green');
            $el.text('работает');
        } else {
            $el.addClass('red');
            $el.text('не работает');
        }
    }

    function render_uptime($el, percent, suffix) {
        $el.removeClass('undefined green red');
        if (percent > 99) {
            $el.addClass('green');
        } else if (percent > 90) {
            $el.addClass('yellow');
        } else {
            $el.addClass('red');
        }
        $el.text(percent + (suffix || ''));
    }

    function render(service) {
        var $service = $('#' + service.id),
            $state = $service.find('.js-state'),
            $day = $service.find('.js-day'),
            $week = $service.find('.js-week'),
            $month = $service.find('.js-month'),
            $year = $service.find('.js-year');
        render_state($state, service.is_up);
        render_uptime($day, service.uptime.day, '%');
        render_uptime($week, service.uptime.week);
        render_uptime($month, service.uptime.month);
        render_uptime($year, service.uptime.year);
    }

    function render_overall(is_up) {
        var $overall = $('#overall'),
            $logo = $overall.find('.js-logo'),
            $state = $overall.find('.js-state');
        render_logo($logo, is_up)
        render_state($state, is_up);
    } 

    $(function() {
        var is_up = true,
            checked_count = 0;
        for (var i in services) {
            get_service_info(services[i])
            .done(function(service) {
                render(service);
                is_up = is_up && service.is_up;
                if (services.length == ++checked_count) {
                    render_overall(is_up);
                }
            });
        }
    });

})(window.jQuery);