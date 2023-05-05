window.onload=readDB();

var items = document.querySelectorAll('.nav-item a');
items[1].setAttribute('aria-current', "page");

function readDB() {
    fetch('/api/modules/getRecipes')
    .then((response) => response.json())
        .then((json) => {
            var htmlTags = "";
            console.info()
            json.map((recipe, i) => {
                htmlTags += 
                '<div class="col-sm mx-2" onclick="window.location.replace(\'/recipe/' + recipe._id + '\')">'+
                    '<div class="d-flex justify-content-center">' +
                        '<div class="tk-recipes-label">' + recipe.name + '</div>' +
                    '</div>' +
                    '<div class="row justify-content-center">' +
                        '<div class="col-sm-4">' + 
                            '<img src="/img/icons/' + recipe.type + '.png" class="tk-recipe-type"></img>' + 
                        '</div>' +
                        '<div class="col-sm-8  align-self-center">' + 
                            '<p class="tk-text">' + 
                                recipe.description +
                            '</p>'+
                        '</div>' + 
                        '<hr class="tk-divider">' +
                    '</div>' + '<div class="row mb-5">' +
                        '<div class="col">' + 
                            '<img src="/img/icons/kcal.png" class="tk-recipe-img"></img>' +
                        '</div>' + 
                        '<div class="col">' +
                            '<img src="/img/icons/carbs.png" class="tk-recipe-img"></img>' +
                        '</div>' +
                        '<div class="col">' +
                            '<img src="/img/icons/protein.png" class="tk-recipe-img"></img>' +
                        '</div>' +
                        '<div class="col">' +
                            '<img src="/img/icons/people.png" class="tk-recipe-img"></img>' +
                        '</div>' + 
                        '<div class="w-100"></div>' +
                        '<div class="col">' +
                            '<div class="tk-panel-data">' + recipe.kcal + ' KCAL</div>' +
                        '</div>' +
                        '<div class="col">' +
                            '<div class="tk-panel-data">' + recipe.carbs + ' gr</div>' +
                        '</div>' +
                        '<div class="col">' +
                            '<div class="tk-panel-data">' + recipe.protein + ' gr</div>' +
                        '</div>' +
                        '<div class="col">' +
                            '<div class="tk-panel-data">' + recipe.people + ' portions</div>' +
                        '</div>' +
                    '</div>' +
                '</div>';
        
                i % 2 == 1 ? htmlTags += '</div><div class="w-100"></div>' : '';
                    
                $('#container').html(htmlTags);      
            });
            if (json.length % 2 == 1) $('#container').append('<div class="col-sm mx-2">');    
        });
}