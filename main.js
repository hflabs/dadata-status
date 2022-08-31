const MONITOR_URL = "https://api.uptimerobot.com/v2/getMonitors";
const API_KEY = "ur77101-51c541a61e534686687f313d";
const MONITORS = "775987346-776633537-776052778";

const services = {
    "dadata.ru": { id: "dadata" },
    clean: { id: "clean" },
    suggestions: { id: "suggestions" },
};

const parse = {
    state: function(monitor) {
        return monitor.status === 2;
    },
    uptime:  function(monitor) {
        const uptime = {};
        const uptimes = monitor.custom_uptime_ratio.split("-");
        uptime.day = Number(uptimes[0]);
        uptime.week = Number(uptimes[1]);
        uptime.month = Number(uptimes[2]);
        uptime.year = Number(uptimes[3]);
        return uptime;
    }
}

const render = {
    overall: function(isUp) {
        const overall = document.querySelector("#overall");
        const logo = overall.querySelector(".js-logo");
        render.logo(logo, isUp);
        const state = overall.querySelector(".js-state");
        render.state(state, isUp);
    },

    service: function(data) {
        const service = document.querySelector("#" + data.id);

        const state = service.querySelector(".js-state");
        render.state(state, data.isUp);

        const day = service.querySelector(".js-day");
        render.uptime(day, data.uptime.day);

        const week = service.querySelector(".js-week");
        render.uptime(week, data.uptime.week);

        const month = service.querySelector(".js-month");
        render.uptime(month, data.uptime.month);

        const year = service.querySelector(".js-year");
        render.uptime(year, data.uptime.year);
    },

    logo: function(el, isUp) {
        el.classList.remove("hidden", "green", "red");
        if (isUp) {
            el.classList.add("fa-check", "green");
        } else {
            el.classList.add("fa-ban", "red");
        }
    },

    state: function(el, isUp) {
        el.classList.remove("undefined", "green", "red");
        if (isUp) {
            el.classList.add("green");
            el.innerText = "работает";
        } else {
            el.classList.add("red");
            el.innerText = "не работает";
        }
    },

    uptime: function(el, percent) {
        el.classList.remove("undefined", "green", "red");
        if (percent > 99) {
            el.classList.add("green");
        } else if (percent > 90) {
            el.classList.add("yellow");
        } else {
            el.classList.add("red");
        }
        el.innerText = percent + "%";
    }
}

async function fetchServices() {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            "api_key": API_KEY,
            "format": "json",
            "monitors": MONITORS,
            "custom_uptime_ratios": "1-7-30-365",
        })
    }

    try {
        const response = await fetch(MONITOR_URL, options);
        if (!response.ok) {
            return Promise.reject(response.status);
        }
        const data = await response.json();
        const monitors = data.monitors;
        if (!monitors.length) {
            return Promise.reject("no monitors");
        }
        for (let monitor of monitors) {
            const service = services[monitor.friendly_name];
            service.isUp = parse.state(monitor);
            service.uptime = parse.uptime(monitor);
            console.log(service);
        }
        return Promise.resolve(services);
    } catch (err) {
        return Promise.reject(err);
    }
}

function init() {
    let isUp = true;
    fetchServices().then((services) => {
        for (let service_name of Object.getOwnPropertyNames(services)) {
            const service = services[service_name];
            render.service(service);
            isUp = isUp && service.isUp;
        }
        render.overall(isUp);
    });
}

document.addEventListener("DOMContentLoaded", init);
