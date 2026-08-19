import Navbar from "../components/Navbar";
import Footer from "../components/Footer";


const MainLayout = ({ children }) => {
  return (
    <>
      <Navbar />

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <Footer />
    </>
  );
};

export default MainLayout;