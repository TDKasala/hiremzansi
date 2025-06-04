import { Helmet } from "react-helmet";
import SkillGapAnalyzer from "@/components/SkillGapAnalyzer";

export default function SkillGapAnalyzerPage() {
  return (
    <div>
      <Helmet>
        <title>Career Skill Gap Analyzer | Hire Mzansi</title>
        <meta 
          name="description" 
          content="Analyze your career skill gaps with our AI-powered tool. Get personalized recommendations and learning resources for your career growth." 
        />
      </Helmet>
      
      <SkillGapAnalyzer />
    </div>
  );
}