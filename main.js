(function ($) {
    "use strict";

    const MONITOR_URL = "https://api.uptimerobot.com/v2/getMonitors";
    const API_KEY = "ur77101-51c541a61e534686687f313d";
    const MONITORS = "775987346-776633537-776052778";
    const services = {
        "dadata.ru": { id: "dadata" },
        clean: { id: "clean" },
        suggestions: { id: "suggestions" },
    };

    function parse_state(monitor) {
        return monitor.status === 2;
    }

    function parse_uptime(monitor) {
        const uptime = {};
        const uptimes = monitor.custom_uptime_ratio.split("-");
        uptime.day = Number(uptimes[0]);
        uptime.week = Number(uptimes[1]);
        uptime.month = Number(uptimes[2]);
        uptime.year = Number(uptimes[3]);
        return uptime;
    }

    function get_services_info() {
        const promise = $.Deferred();
        const data = {
            api_key: API_KEY,
            format: "json",
            monitors: MONITORS,
            custom_uptime_ratios: "1-7-30-365",
        };
        $.ajax({ type: "POST", url: MONITOR_URL, data: data })
            .done((response) => {
                const monitors = response.monitors;
                if (!monitors.length) {
                    promise.reject();
                } else {
                    for (let monitor of monitors) {
                        const service = services[monitor.friendly_name];
                        service.is_up = parse_state(monitor);
                        service.uptime = parse_uptime(monitor);
                        console.log(service);
                    }
                    promise.resolve(services);
                }
            })
            .fail(function () {
                promise.reject();
            });
        return promise;
    }

    function render_logo($el, is_up) {
        $el.removeClass("hidden green red");
        if (is_up) {
            $el.addClass("fa-check green");
        } else {
            $el.addClass("fa-ban red");
        }
    }

    function render_state($el, is_up) {
        $el.removeClass("undefined green red");
        if (is_up) {
            $el.addClass("green");
            $el.text("работает");
        } else {
            $el.addClass("red");
            $el.text("не работает");
        }
    }

    function render_uptime($el, percent) {
        $el.removeClass("undefined green red");
        if (percent > 99) {
            $el.addClass("green");
        } else if (percent > 90) {
            $el.addClass("yellow");
        } else {
            $el.addClass("red");
        }
        $el.text(percent + "%");
    }

    function render(service) {
        const $service = $("#" + service.id);

        const $state = $service.find(".js-state");
        render_state($state, service.is_up);

        const $day = $service.find(".js-day");
        render_uptime($day, service.uptime.day);

        const $week = $service.find(".js-week");
        render_uptime($week, service.uptime.week);

        const $month = $service.find(".js-month");
        render_uptime($month, service.uptime.month);

        const $year = $service.find(".js-year");
        render_uptime($year, service.uptime.year);
    }

    function render_overall(is_up) {
        const $overall = $("#overall");
        const $logo = $overall.find(".js-logo");
        render_logo($logo, is_up);
        const $state = $overall.find(".js-state");
        render_state($state, is_up);
    }

    $(function () {
        let is_up = true;
        get_services_info().done((services) => {
            for (let service_name of Object.getOwnPropertyNames(services)) {
                const service = services[service_name];
                render(service);
                is_up = is_up && service.is_up;
            }
            render_overall(is_up);
        });
    });
})(window.jQuery);
