import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen flex bg-[#F6F1E4]">

            <Sidebar />

            <main className="flex-1 min-w-0">
                {children}
            </main>

        </div>
    );
};

export default Layout;