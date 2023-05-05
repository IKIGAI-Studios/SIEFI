window.onload=setData();

var items = document.querySelectorAll('.nav-item a');
items[2].setAttribute('aria-current', "page");
const modules = [];
function setData() {
    fetch('/api/modules/getModules')
    .then((response) => response.json())
        .then((json) => { 
            json.map((module) => {
                switch(module.name) {
                    case 'stove':
                            scnds = module.time_usage.seconds
                            hours = (scnds / 60) / 60
                            kwh = hours * 8.09
                            $('#stove_time_usage').text('Time usage: ' + Math.round(scnds / 60) + ' minutes')
                            $('#stove_electrical_usage').text('Electrical usage: $' + Math.round(kwh) + ' mxm')
                            $('#stove_progress_bar').css('width', hours >= 5 ? 100 + '%' : (hours * 20) + '%')
                            $('#stove_electrical_indicator').text(hours >= 5? 'Alta' : hours >= 1? 'Media' : 'Baja')
                            fetch('/api/modules/getAvgValues/stove')
                            .then((response) => response.json())
                                .then((json) => { $('#stove_avg_detection').text('Average detection (all time): ' + Math.round(json[0].averageValue) + ' °') });
                        break;
                    case 'smoke_detector':
                            fetch('/api/modules/getAvgValues/smoke_detector')
                            .then((response) => response.json())
                                .then((json) => { 
                                    percent = Math.round(json[0].averageValue)
                                    $('#smoke_avg_detection').text('Average detection (all time): ' + percent + ' %') 
                                    $('#smoke_progress_bar').css('width', percent + '%')
                                    $('#smoke_detection_indicator').text(percent >= 60? 'Alto' : percent >= 20? 'Medio' : 'Bajo')
                                });
                        break;
                    case 'extractor':
                            $('#extractor_activation_count').text('Activations (all time): ' + module.activations + ' times') 
                            $('#extractor_max_activated').text('Max duration activated: ' + Math.round(module.max_active.seconds / 60 ) + ' minutes') 
                        break;
                }
            })
        });
}