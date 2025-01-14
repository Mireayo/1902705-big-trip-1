import PointView from '../view/point-view';
import EditFormView from '../view/edit-form-view';
import { remove, render, renderPosition, replace } from '../utils/render.js';

const Mode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
};

export default class PointPresenter {
  #pointContainer = null;

  #point = null;
  #prevPoint = null;
  #pointComponent = null;
  #pointEditComponent = null;

  #changeData = null;
  #changeMode = null;
  #mode = Mode.DEFAULT;

  constructor(pointContainer, changeData, changeMode) {
    this.#pointContainer = pointContainer;
    this.#changeData = changeData;
    this.#changeMode = changeMode;
  }

  init = (point) => {
    this.#point = point;
    this.#prevPoint = this.#point;

    const prevPointComponent = this.#pointComponent;
    const prevEditPointComponent = this.#pointEditComponent;

    this.#pointComponent = new PointView(point);
    this.#pointEditComponent = new EditFormView(point);

    this.#pointComponent.setEditClickHandler(() => {
      this.#replacePointToForm();
      document.addEventListener('keydown', this.#onEscKeydowm);
    });

    this.#pointEditComponent.setFormSubmitHandler(() => {
      this.#replaceFormToPoint();
      document.removeEventListener('keydown', this.#onEscKeydowm);
    });

    this.#pointComponent.setFavoriteClickHandler(this.#handleFavorite);

    render(this.#pointContainer, this.#pointComponent, renderPosition.BEFOREEND);

    if (this.#mode === Mode.DEFAULT && prevPointComponent) {
      replace(this.#pointComponent, prevPointComponent);
    }
    if (this.#mode === Mode.EDITING && prevEditPointComponent) {
      replace(this.#pointEditComponent, prevEditPointComponent);
    }

    remove(prevPointComponent);
    remove(prevEditPointComponent);
  }

  resetView = () => {
    if (this.#mode !== Mode.DEFAULT) {
      this.#replaceFormToPoint();
    }
  }

  destroy = () => {
    remove(this.#pointComponent);
    remove(this.#pointEditComponent);
  }

  #replacePointToForm = () => {
    replace(this.#pointEditComponent, this.#pointComponent);
    this.#changeMode();
    this.#mode = Mode.EDITING;
  }

  #replaceFormToPoint = () => {
    replace(this.#pointComponent, this.#pointEditComponent);
    this.#mode = Mode.DEFAULT;
  }

  #onEscKeydowm = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc')
    {
      evt.preventDefault();
      this.#replaceFormToPoint();
      this.#pointEditComponent.reset(this.#prevPoint);
      document.removeEventListener('keydown', this.#onEscKeydowm);
    }
  }

  #handleFavorite = () => {
    this.#changeData({ ...this.#point, isFavorite: !this.#point.isFavorite });
  }
}
