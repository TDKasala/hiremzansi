import { Helmet } from "react-helmet";
import JobSearch from "@/components/JobSearch";

export default function JobsPage() {
  return (
    <div>
      <Helmet>
        <title>South African Job Search | Hire Mzansi</title>
        <meta 
          name="description" 
          content="Find job opportunities across South Africa. Search through hundreds of jobs and find your perfect match." 
        />
      </Helmet>
      
      <JobSearch />
    </div>
  );
}