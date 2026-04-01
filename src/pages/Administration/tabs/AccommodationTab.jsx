import Projects from './pages/Projects';
import PaymentsDue from './pages/PaymentsDue';
import Employees from './pages/Employees';
import EmployeeDetail from './pages/EmployeeDetail';
import WorkAgenda from './pages/WorkAgenda';
import Management from './pages/Management';
import ProjectDetail from './pages/ProjectDetail';
import NewProject from './pages/NewProject';
import Certifications from './pages/Certifications';
import Test from './pages/Test';
import Dashboard from './pages/Dashboard';
import Administration from './pages/Administration';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Projects": Projects,
    "PaymentsDue": PaymentsDue,
    "Employees": Employees,
    "EmployeeDetail": EmployeeDetail,
    "WorkAgenda": WorkAgenda,
    "Management": Management,
    "ProjectDetail": ProjectDetail,
    "NewProject": NewProject,
    "Certifications": Certifications,
    "Test": Test,
    "Dashboard": Dashboard,
    "Administration": Administration,
}

export const pagesConfig = {
    mainPage: "Projects",
    Pages: PAGES,
    Layout: __Layout,
};