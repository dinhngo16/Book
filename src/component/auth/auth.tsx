import { useLocation } from "react-router-dom";
import { useCurrentApp } from "../context/app.context";
import { Button, Result } from "antd";
import { Link } from "react-router-dom";
interface Iprops {
    children: React.ReactNode
};
const ProtectedRoute = (props: Iprops) => {
    const {isAuthenticated,user} = useCurrentApp();
    const location = useLocation();
    if (!isAuthenticated) {
        return (<Result
            status="404"
            title="Not login"
            subTitle="Sorry, the page you visited does not exist."
            extra={<Button type="primary"><Link to='/'>Trang chủ</Link></Button>}
        />)
    }
    const isAdminRoute = location.pathname.includes('admin');
    if (isAdminRoute && (!isAuthenticated || (isAuthenticated && !['admin'].includes('admin')))) {
        const role = user?.role;
        if (role !== 'admin'){
            return (
                <Result
                    status="403"
                    title="403"
                    subTitle="Sorry, you are not authorized to access this page."
                    extra={<Button type="primary"><Link to='/'>Trang chủ</Link></Button>}
                />
            )
        }
    }
    return (
        <>
            {props.children}
        </>
    )
};
export default ProtectedRoute;