import { fetchAccountAPI } from "@/services/api";
import { createContext, useContext, useEffect, useState } from "react";
import CircleLoader  from "react-spinners/CircleLoader";

interface IAppContext {
    isAuthenticated: boolean;
    setIsAuthenticated: (v: boolean) => void;
    setUser: (v: iUser | null) => void;
    user: iUser | null;
    carts: iResCart[];
    setCarts: (v: iResCart[] | []) => void;
    isAppLoading: boolean;
    setIsAppLoading: (v: boolean) => void;
}

const CurrentAppContext = createContext<IAppContext | null>(null);

type TProps = {
    children: React.ReactNode
}

export const AppProvider = (props: TProps) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<iUser | null>(null);
    const [isAppLoading, setIsAppLoading] = useState<boolean>(true);
    const [carts, setCarts] = useState<iResCart[]>([]); 

    useEffect(() => {
        const fetchAccount = async () => {
            const res = await fetchAccountAPI();
            if (res.data) {
                setUser(res.data.user);
                setIsAuthenticated(true);
            }
            setIsAppLoading(false)
        }

        fetchAccount();
    }, [])

    

    return (
        <>
            {isAppLoading === false ?
                <CurrentAppContext.Provider value={{
                    isAuthenticated, user, setIsAuthenticated, setUser,
                    isAppLoading, setIsAppLoading, carts, setCarts
                }}>
                    {props.children}
                </CurrentAppContext.Provider>
                :
                <div style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)"
                }}>
                    <CircleLoader 
                        size={60}
                        color="#36d6b4"
                    />
                </div>
            }

        </>

    );
};

export const useCurrentApp = () => {
    const currentAppContext = useContext(CurrentAppContext);

    if (!currentAppContext) {
        throw new Error(
            "useCurrentApp has to be used within <CurrentAppContext.Provider>"
        );
    }

    return currentAppContext;
};

