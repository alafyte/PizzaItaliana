import {CheckRolePropsType} from "../types";
import {Navigate, useLocation} from "react-router-dom";

const RequireAuth = ({ children, currentUserRole, userRoles } : CheckRolePropsType) => {
    const location = useLocation();

    if (currentUserRole) {
        if (userRoles) {
            if (userRoles.includes(currentUserRole)) {
                return <>{children}</>
            } else {
                return <Navigate to="/" />
            }
        } else {
            return <>{children}</>
        }
    } else {
        return <Navigate to="/users/login" state={{ path: location.pathname }} />
    }
}
export default RequireAuth