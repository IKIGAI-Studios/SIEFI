window.onload=readDB();
var items = document.querySelectorAll('.nav-item a');
items[0].setAttribute('aria-current', "page");

jsonRead = {};

function readJson() {
    fetch('/api/bin/modules')
    .then((response) => response.json())
    .then((json) => {
        $('#toScale').prop('checked', json.modules[0].state);
        $('#scale_turn').html(json.modules[0].state ? 'Turn Off' : 'Turn On');
        $('#scale_weight').html(json.modules[0].value + ' gr');

        $('#toStove').prop('checked', json.modules[1].state);
        $('#stove_turn').html(json.modules[1].state ? 'Turn Off' : 'Turn On');
        $('#stove_temp').html(json.modules[1].value + ' C°');
        
        msj = 'Everything seems normal';
        if (json.modules[2].value >= 30 && json.modules[2].value <= 60) {
            msj = 'Warning, please open all windows';
        } else if (json.modules[2].value >= 60) {
            msj = 'Alert, FIRE';
        }
        $('#fire_percent').html(json.modules[2].value + ' %');
        $('#fire_message').html(msj);
        
        $('#toSmoke').prop('checked', json.modules[3].state);
        $('#smoke_turn').html(json.modules[3].state ? 'Turn Off' : 'Turn On');
        $('#smoke_message').html(json.modules[3].state ? 'On' : 'Off');

        $('#toGas').prop('checked', json.modules[4].state);
        $('#gas_turn').html(json.modules[4].state ? 'Close' : 'Open');
        $('#gas_message').html(json.modules[4].state ? 'Open' : 'Close');

        $('#toOven').prop('checked', json.modules[5].state);
        $('#oven_turn').html(json.modules[5].state ? 'Turn Off' : 'Turn On');
        $('#oven_temp').html(json.modules[5].value + ' C°');
    });
}

function readDB() {
    fetch('/api/modules/getModules')
    .then((response) => response.json())
    .then((json) => {
        if (!json) window.location.replace("/login");
        json.map((module) => {
            switch (module.name) {
                case 'extractor': 
                        $('#toSmoke').prop('checked', module.active);
                        $('#smoke_turn').html(module.active ? 'Turn Off' : 'Turn On');
                        $('#smoke_message').html(module.active ? 'On' : 'Off');
                    break;
                case 'smoke_detector': 
                        msj = 'Everything seems normal';
                        if (module.values[0].value >= 30 && module.values[0].value <= 60) {
                            msj = 'Warning, please open all windows';
                        } else if (module.values[0].value >= 60) {
                            msj = 'Alert, FIRE';
                        }
                        $('#fire_percent').html(module.values[0].value + ' %');
                        $('#fire_message').html(msj);
                    break;
                case 'scale': 
                        $('#toScale').prop('checked', module.active);
                        $('#scale_turn').html(module.active ? 'Turn Off' : 'Turn On');
                        $('#scale_weight').html((module.active ? module.values[0].value : 0) + ' gr');
                    break;
                case 'stove': 
                        $('#toStove').prop('checked', module.active);
                        $('#stove_turn').html(module.active ? 'Turn Off' : 'Turn On');
                        $('#stove_temp').html(module.values[0].value + ' C°');
                    break;
                case 'oven': 
                        $('#toOven').prop('checked', module.active);
                        $('#oven_turn').html(module.active ? 'Turn Off' : 'Turn On');
                        $('#oven_temp').html(module.values[0].value + ' C°');
                        break;
                case 'gas': 
                        $('#toGas').prop('checked', module.active);
                        $('#gas_turn').html(module.active ? 'Close' : 'Open');
                        $('#gas_message').html(module.active ? 'Open' : 'Close');
                    break;
            }
        });
    });
}

// setInterval('readJson()', 2000);
setInterval('readDB()', 2000);

function state_change(module, state) {
    url = '/api/bin/';
    state ? url += 'start' : url += 'stop';
    url += '_' + module;
    fetch(url)
    .then((response) => response.json())
        .then((json) => {
            json ? bsAlert(`The ${module} has been turned <strong>${state ? 'on' : 'off'}</strong> successfuly`, 'primary') : bsAlert(`The ${module} <strong>couldn't</strong> be turned  ${state ? 'on' : 'off'}`, 'danger');
        });
}

function setTempTarget() {
    url = '/api/modules/setTempTarget/';
    url += $('#input_temp_stove').val()
    if (!$('#input_temp_stove').val()) bsAlert(`You must enter a <strong>valid</strong> temperature`, 'warning')
    else {
        fetch(url)
        .then((response) => response.json())
            .then((json) => {
                json ? bsAlert(`Temperature target settled in: <strong>${$('#input_temp_stove').val()}</strong> °`, 'info') : bsAlert(`The temperature target <strong>couldn't</strong> be settled`, 'danger')
                ;
            });
    }
}