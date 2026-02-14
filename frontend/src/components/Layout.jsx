import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import RecentPostsSidebar from './RecentPostsSidebar';
import GlobalHeader from './GlobalHeader';
import Footer from './Footer';

export default function Layout() {
    return (
        <>
            <GlobalHeader />
            <div className="app-layout" style={{ paddingTop: '56px' }}>
                {/* Left Sidebar */}
                <Sidebar />

                {/* Main Content Area */}
                <main className="main-content">
                    <Outlet />
                </main>

                {/* Right Sidebar - Recent Posts */}
                <RecentPostsSidebar />
            </div>
            <Footer />
        </>
    );
}
