import {TICK} from '../actions/actionTypes.js';

const initialState = {
    time: null,
    interval: null
}

const rootReducer = (state = initialState, action) => {
    switch(action.type) {
        case TICK:
            return {
                ...state,
                time: action.time
            }
            default:
                return state;
    }
}

export default rootReducer