import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import HomePage from '../pages/HomePage';
import ExercisePage from '../pages/ProblemPage';
import UploadExercisePage from '../pages/UploadProblemPage';
import UploadSolutionPage from '../pages/UploadSolutionPage';
import UserPage from '../pages/UserPage'
import ModifyProblemPage from '../pages/ModifyProblemPage';
import ModifySolutionPage from '../pages/ModifySolutionPage';
import HelpPage from '../pages/HelpPage';
export default function AppRoutes() {
  return (
      <Routes>
        <Route path='/' element={<HelpPage/>}/>
        <Route path="/HomePage" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/ejercicio/:id_problema" element={<ExercisePage />} />
        <Route path="/modificar-ejercicio/:id" element={<ModifyProblemPage />} /> 
        <Route path="/subir-ejercicio" element={<UploadExercisePage />} />
        <Route path="/subir-solucion/:id_problema" element={<UploadSolutionPage />} />
        <Route path="/modificar-solucion/:id_solucion" element={<ModifySolutionPage />} />
        <Route path ="/perfil" element= {<UserPage/>}/>
      </Routes>
  );
}