function iniciarApp(){

    const resultadoCards = document.querySelector('#resultado');
    const selectCategorias = document.querySelector('#categorias');
    if(selectCategorias){
        selectCategorias.addEventListener('change', selecionarCategoria);
        obtenerCategorias();
    }

    const favoriteDiv = document.querySelector('.favoritos');
    if(favoriteDiv){
        getFavorites();
    }
    
    const modal = new bootstrap.Modal('#modal', {});

    function obtenerCategorias(){
        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php';

        fetch(url)
                .then(response => response.json())
                .then(result => mostrarCategorias(result.categories))
    }

    function mostrarCategorias(categoria = []){
        categoria.forEach (categoria => {
            const option = document.createElement('OPTION');
            option.value = categoria.strCategory;
            option.textContent = categoria.strCategory;

            selectCategorias.appendChild(option);
        })
    }

    function selecionarCategoria(e){
        const categoria = e.target.value;
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`;
        fetch(url)
                .then(response => response.json())
                .then(result => mostrarRecetas(result.meals));
}

    function mostrarRecetas(recetas = []){

        limpiarHtml(resultadoCards);

        const heading = document.createElement('H2');
            heading.classList.add('text-center', 'text-black', 'my-3');
            heading.textContent = recetas.length ? 'Recetas' : 'No hay recetas';
            resultadoCards.appendChild(heading);

        recetas.forEach( receta =>{
            const {strMeal, strMealThumb, idMeal} = receta;

            const recetaContenedor = document.createElement('DIV');
            recetaContenedor.classList.add('col-md-4');

            const recetaCard = document.createElement('DIV');
            recetaCard.classList.add('card', 'mb-4');

            const recetaImagen = document.createElement('IMG');
            recetaImagen.classList.add('card-img-top');
            recetaImagen.alt = `Imagen ilustrativa de la receta ${strMeal ?? receta.title}`;
            recetaImagen.src = strMealThumb ?? receta.img;

            const recetaCardBody = document.createElement('DIV');
            recetaCardBody.classList.add('card-body');

            const recetaHeading = document.createElement('H3');
            recetaHeading.classList.add('card-title', 'mb-3');
            recetaHeading.textContent = strMeal ?? receta.title;

            const recetaButton = document.createElement('BUTTON');
            recetaButton.classList.add('btn', 'btn-danger', 'w-100');
            recetaButton.textContent = 'Ver Receta';
            /* recetaButton.dataset.bsTarget = '#modal';
            recetaButton.dataset.bsToggle = 'modal'; */
            recetaButton.onclick = function(){
                selecionarReceta(idMeal ?? receta.id);
            }

            // Inyecatr en código html
            recetaCardBody.appendChild(recetaHeading);
            recetaCardBody.appendChild(recetaButton);

            recetaCard.appendChild(recetaImagen);
            recetaCard.appendChild(recetaCardBody);

            recetaContenedor.appendChild(recetaCard);
            resultadoCards.appendChild(recetaContenedor);
        })
    }
 
    function selecionarReceta(id){
        const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`;

        fetch(url)
                .then(response => response.json())
                .then(result => mostrarRecetaModal(result.meals[0]))
    }

    function mostrarRecetaModal(receta){
        const {idMeal, strInstructions, strMeal, strMealThumb} = receta;
        const modalTitle = document.querySelector('.modal .modal-title');
        const modalBody = document.querySelector('.modal .modal-body');

        modalTitle.textContent = strMeal;
        modalBody.innerHTML = `
            <img class="img-fluid" src="${strMealThumb}" alt="Imagen ilustrativa de receta ${strMeal}"/>
            <h3 class="my-3">Instrucciones</h3>
            <p>${strInstructions}</p>
            <h3 class="my-3">Cantidaes e ingredientes</h3>
        `

        const listGroup = document.createElement('UL');
        listGroup.classList.add('list-group');
        // mostrar cantidaes de ingredientes
        for(let i=1; i<=20; i++){
            const ingredient = receta[`strIngredient${i}`];
            const measure = receta[`strMeasure${i}`];

            const ingredientLi = document.createElement('LI');
            ingredientLi.classList.add('list-group-item');
            ingredientLi.textContent = `${ingredient} - ${measure}`;

            listGroup.appendChild(ingredientLi);
        }

        modalBody.appendChild(listGroup);

        // botondes de guardar favortio y cerrar
        const modalFooter = document.querySelector('.modal-footer');
        limpiarHtml(modalFooter);

        const btnFavorite = document.createElement('BUTTON');
        btnFavorite.classList.add('btn', 'btn-danger', 'col');
        btnFavorite.textContent = favoriteExists(idMeal) ? 'Eliminar favorito' : 'Guardar favorito';
        modalFooter.appendChild(btnFavorite);

        //localStorage
        btnFavorite.onclick = function(){
            if(favoriteExists(idMeal)){
                deleteFavorite(idMeal);
                btnFavorite.textContent = 'Guardar favorito';
                toast('Eliminado de favoritos correctamente');
                return;
            };
            addFavorite({
                id: idMeal,
                title: strMeal,
                img: strMealThumb
            });
            btnFavorite.textContent = 'Eliminar favorito';
            toast('Guardado en favoritos correctamente');
        }

        const btnCloseModal = document.createElement('BUTTON');
        btnCloseModal.classList.add('btn', 'btn-secondary', 'col');
        btnCloseModal.textContent = 'Cerrar';
        modalFooter.appendChild(btnCloseModal);
        btnCloseModal.onclick = function(){
            modal.hide();
        }

        // muestra el modal
        modal.show();
    }

    function addFavorite(receta){
        const favorites = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        localStorage.setItem('favoritos', JSON.stringify([...favorites, receta]));  
    }

    function favoriteExists(id){
        const favorites = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        return favorites.some(favorite => favorite.id === id);
    }

    function deleteFavorite(id){
        const favorites = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        const newFavorites = favorites.filter(favorite => favorite.id !== id);
        localStorage.setItem('favoritos', JSON.stringify(newFavorites));
    }

    function toast(message){
        const toastDiv = document.querySelector('#toast');
        const toastBody = document.querySelector('.toast-body');

        const toast = new bootstrap.Toast(toastDiv);
        toastBody.textContent = message;
        toast.show(toastBody);
    }

    function getFavorites(){
        const  favorites = JSON.parse(localStorage.getItem('favoritos')) ?? []; 
        if(favorites.length){
            mostrarRecetas(favorites);
            return
        }

        const noFavorites = document.createElement('P');
        noFavorites.textContent = 'No hay favoritos aún';
        noFavorites.classList.add('fs-4', 'text-center', 'font-bold', 'mt-5');
        resultadoCards.appendChild(noFavorites);
        
    }

    function limpiarHtml(selector){
        while(selector.firstChild){
            selector.removeChild(selector.firstChild);
        }
    }

}

document.addEventListener('DOMContentLoaded', iniciarApp);