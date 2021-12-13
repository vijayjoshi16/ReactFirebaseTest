export const initialState = null;

export const reducer = (state,action)=>{
    if(action.type=="ADD"){
        return action.payload;
    }
    if(action.typE=="REMOVE"){
        return null;
    }
}