import Search from './modules/Search';
import Recipe from './modules/Recipe';
import List from './modules/List';
import Likes from './modules/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';

import { elements, renderLoader, clearLoader } from './views/base';

//global state of the app
// - search object
// - current recipe object
// - shopping list object
// - liked recipes
const state = {

}


// Search controller
const controllSearch = async () => {
  // get query from the view
  const query = searchView.getInput()

  if (query) {
    // new search object, add to state
    state.search = new Search(query)
    // prepare UI for results
    searchView.clearInput() // clears search input
    searchView.clearResults() // clears results li
    renderLoader(elements.searchResults) // renders loader
    // search for recipes
    try {
      await state.search.getResults()
      // render results on UI
      clearLoader() // removes loader after results
      searchView.renderResults(state.search.results);
    } catch (error) {
      alert('Something went wrong!');
      clearLoader()
    }
  }
}

elements.searchForm.addEventListener('submit', e => {
  e.preventDefault()
  controllSearch()
});

elements.searchResultPages.addEventListener('click', e => {
  const button = e.target.closest('.btn-inline');
  if (button) {
    const goToPage = parseInt(button.dataset.goto);
    searchView.clearResults()
    searchView.renderResults(state.search.results, goToPage);
  }
});

// Recipe controller
const controllRecipe = async () => {
  const id = window.location.hash.replace('#', '');

  if (id) {
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    if (state.search) searchView.highLightSelected(id);

    state.recipe = new Recipe(id);


    try {
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();
      state.recipe.calcTime();
      state.recipe.calcServings();

      clearLoader();

      recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
    } catch (error) {
      alert('Error processing recipe');
    }
  }
}

['hashchange', 'load'].forEach(event => window.addEventListener(event, controllRecipe));




const controlList = () => {
  if (!state.list) state.list = new List();

  state.recipe.ingredients.forEach(el => {
    const item = state.list.addItem(el);
    listView.renderItem(item);
  })
}

const controllLike = () => {
  if(!state.likes) state.likes = new Likes();

  const currentID = state.recipe.id;

  if(!state.likes.isLiked(currentID)){
    const newLike = state.likes.addLike(state.recipe);
    likesView.toggleLikeBtn(true);
    likesView.renderLike(newLike);
  } else {
    state.likes.deleteLike(currentID);
    likesView.toggleLikeBtn(false);
    likesView.deleteLike(currentID);
  }

  likesView.toggleLikeMenu(state.likes.getNumLikes());
}

window.addEventListener('load', () => {
  state.likes = new Likes();
  state.likes.readStorage();
  likesView.toggleLikeMenu(state.likes.getNumLikes());
  state.likes.likes.forEach(like => likesView.renderLike(like))
});

elements.shopping.addEventListener('click', e => {
  const id = e.target.closest('.shopping__item').dataset.itemid;

  if (e.target.matches('.shopping__delete, .shopping__delete *')) {
    state.list.deleteItem(id);

    listView.deleteItem(id);
  } else if (e.target.matches('.shopping__count-value')) {
    const val = parseFloat(e.target.value, 10);
    state.list.updateCount(id, val);
  }
})


elements.recipe.addEventListener('click', e => {
  if (e.target.matches('.btn-decrease, .btn-decrease *')) {
    if (state.recipe.servings > 1) {
      state.recipe.updateServings('dec');
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (e.target.matches('.btn-increase, .btn-increase *')) {
    state.recipe.updateServings('inc');
    recipeView.updateServingsIngredients(state.recipe);
  } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
    controlList();
  } else if (e.target.matches('.recipe__love, .recipe__love *')) {
    controllLike();
  }
});






//d00841cb6249505adea341863ff03dcf
//https://www.food2fork.com/api/search?key=YOUR_API_KEY&q=chicken%20breast&page=2
