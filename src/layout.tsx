import { Outlet } from "react-router-dom";
import AppHeader from "./component/layout/app.header";
import { useState } from "react";

function Layout() {
  const [searchTerm,setSearchTerm] = useState("")
  return (
    <div>
      <AppHeader 
        searchTerm = {searchTerm}
        setSearchTerm = {setSearchTerm}
      />
      <Outlet context={[searchTerm,setSearchTerm]} />
    </div>
  )
}

export default Layout;
