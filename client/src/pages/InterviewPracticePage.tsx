import { Helmet } from "react-helmet";
import InterviewSimulator from "@/components/InterviewSimulator";

export default function InterviewPracticePage() {
  return (
    <div>
      <Helmet>
        <title>AI Interview Practice | ATSBoost</title>
        <meta 
          name="description" 
          content="Practice job interviews with our AI-powered interview simulator. Get instant feedback and improve your performance." 
        />
      </Helmet>
      
      <InterviewSimulator />
    </div>
  );
}