import { Navigate } from "react-router-dom";
import {ShouldBeLoggedInPropsType} from "../types";

const ShouldBeLoggedIn = ({children, shouldBeLoggedIn} : ShouldBeLoggedInPropsType)=> {

    const token = !!localStorage.getItem("token");

    if (shouldBeLoggedIn === token)
        return <>{children}</>;
    else if (shouldBeLoggedIn)
        return <Navigate to="/users/login"/>
    else
        return <Navigate to="/"/>
}
export default ShouldBeLoggedIn;