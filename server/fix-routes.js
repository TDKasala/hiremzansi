const fs = require('fs');

// Create a replacement for the analyze-cv endpoint
const newAnalyzeEndpoint = `
  // Analyze CV endpoint with South African context scoring (20% of score)
  app.post("/api/analyze-cv/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cvId = parseInt(req.params.id);
      
      if (isNaN(cvId)) {
        return res.status(400).json({ 
          error: "Invalid CV ID", 
          message: "Please provide a valid CV ID." 
        });
      }
      
      // Retrieve the CV from the database
      const cv = await storage.getCV(cvId);
      
      if (!cv) {
        return res.status(404).json({ 
          error: "CV not found", 
          message: "The CV with the specified ID was not found." 
        });
      }
      
      // Process the CV content for analysis
      let textContent = cv.content || "";
      
      // Check and sanitize content if it's HTML
      if (textContent.includes('<!DOCTYPE') || 
          textContent.includes('<html') || 
          textContent.includes('<body') ||
          (textContent.includes('<') && textContent.includes('>'))) {
        
        console.log("Detected HTML content, sanitizing for analysis");
        
        // More thorough HTML stripping
        textContent = textContent
          .replace(/<style[^>]*>[\\s\\S]*?<\\/style>/gi, '') // Remove style tags and their content
          .replace(/<script[^>]*>[\\s\\S]*?<\\/script>/gi, '') // Remove script tags and their content
          .replace(/<[^>]+>/g, ' ') // Replace all remaining HTML tags with spaces
          .replace(/&[a-z]+;/gi, ' ') // Replace HTML entities
          .replace(/\\s+/g, ' ') // Replace multiple spaces with single space
          .trim();
        
        console.log("Sanitized content length:", textContent.length);
      }
      
      // Simple South African CV Analysis
      // SOUTH AFRICAN CONTEXT DETECTION (20% of total score)
      // B-BBEE related terms (10 points per instance, max 20)
      const bbbeeTerms = ["b-bbee", "bbbee", "broad based black economic empowerment", "bee"];
      let bbbeeScore = 0;
      for (const term of bbbeeTerms) {
        if (textContent.toLowerCase().includes(term)) {
          bbbeeScore += 10;
          if (bbbeeScore >= 20) break;
        }
      }
      
      // NQF levels (5 points per level, max 10)
      const nqfMatches = textContent.match(/nqf level \\d+|national qualifications? framework level \\d+|nqf \\d+/gi) || [];
      const nqfScore = Math.min(10, nqfMatches.length * 5);
      
      // South African cities (2 points each, max 5)
      const saCities = ["johannesburg", "cape town", "durban", "pretoria"];
      let citiesScore = 0;
      for (const city of saCities) {
        if (textContent.toLowerCase().includes(city)) {
          citiesScore += 2;
          if (citiesScore >= 5) break;
        }
      }
      
      // SA context score (20% of total)
      const saContextScore = Math.min(100, bbbeeScore + nqfScore + citiesScore);
      
      // CV FORMAT EVALUATION (40% of score)
      // Section headers (15 points each, max 60)
      const sectionHeaders = [
        "summary", "profile", "objective",
        "skills", "experience", "education", "qualifications"
      ];
      
      let sectionsScore = 0;
      const detectedSections = [];
      
      for (const section of sectionHeaders) {
        const pattern = new RegExp(\`^${section}s?:?\$\`, 'im');
        if (pattern.test(textContent)) {
          sectionsScore += 15;
          detectedSections.push(section);
          if (sectionsScore >= 60) break;
        }
      }
      
      // Bullet points and formatting (10 points each)
      const hasBullets = textContent.includes("•") || /^\\s*-\\s+/m.test(textContent);
      const hasDates = /\\d{4}\\s*(-|to)\\s*\\d{4}|\\d{4}\\s*(-|to)\\s*(present|current)/i.test(textContent);
      const hasAchievements = /increased|improved|reduced|achieved|by\\s+\\d+%/i.test(textContent);
      
      // Format score (40% of total)
      const formatScore = Math.min(100, 
        sectionsScore + 
        (hasBullets ? 10 : 0) + 
        (hasDates ? 10 : 0) + 
        (hasAchievements ? 10 : 0)
      );
      
      // SKILLS IDENTIFICATION (40% of score)
      // High-demand skills 2025 (12 points each)
      const highDemandSkills = [
        "data analysis", "machine learning", "python", 
        "cloud", "cybersecurity", "project management"
      ];
      
      // Regular skills (8 points each)
      const regularSkills = [
        "excel", "microsoft office", "communication", 
        "leadership", "sql", "javascript", "html"
      ];
      
      // Count skills
      const foundHighDemandSkills = highDemandSkills.filter(skill => 
        textContent.toLowerCase().includes(skill.toLowerCase())
      );
      
      const foundRegularSkills = regularSkills.filter(skill => 
        textContent.toLowerCase().includes(skill.toLowerCase())
      );
      
      // Skills score (40% of total)
      const skillsScore = Math.min(100,
        (foundHighDemandSkills.length * 12) +
        (foundRegularSkills.length * 8)
      );
      
      // Calculate overall score with weighted components
      const overallScore = Math.round(
        (skillsScore * 0.4) +
        (formatScore * 0.4) +
        (saContextScore * 0.2)
      );
      
      // Generate strengths based on found elements
      const strengths = [];
      if (bbbeeScore > 0) {
        strengths.push("Your CV includes B-BBEE information that South African employers value.");
      }
      if (foundHighDemandSkills.length > 0) {
        strengths.push("Your CV highlights high-demand skills for 2025 that employers are seeking.");
      }
      if (hasBullets) {
        strengths.push("Your CV uses bullet points effectively to highlight achievements.");
      }
      if (detectedSections.length >= 3) {
        strengths.push("Your CV has clear section headers that improve readability.");
      }
      if (hasAchievements) {
        strengths.push("You've included quantified achievements that demonstrate impact.");
      }
      
      // If not enough strengths, add generic ones
      if (strengths.length < 3) {
        strengths.push("Your CV demonstrates professional experience.");
        strengths.push("Your CV has been successfully processed.");
      }
      
      // Generate improvements based on missing elements
      const improvements = [];
      if (bbbeeScore === 0) {
        improvements.push("Include B-BBEE status information to appeal to transformation-focused companies.");
      }
      if (nqfScore === 0) {
        improvements.push("Add NQF levels for your qualifications to align with South African standards.");
      }
      if (foundHighDemandSkills.length === 0) {
        improvements.push("Add more high-demand skills for 2025 like data analysis or cloud computing.");
      }
      if (!hasBullets) {
        improvements.push("Use bullet points to make your achievements stand out.");
      }
      if (!hasAchievements) {
        improvements.push("Include quantified achievements to demonstrate your impact.");
      }
      
      // If not enough improvements, add generic ones
      if (improvements.length < 3) {
        improvements.push("Tailor your CV to specific job descriptions for better results.");
        improvements.push("Consider adding more South African context relevant to employers.");
      }
      
      // Combine all skills
      const allSkills = [...foundHighDemandSkills, ...foundRegularSkills];
      
      // Determine SA relevance rating
      let saRelevance = "Low";
      if (saContextScore >= 80) saRelevance = "Excellent";
      else if (saContextScore >= 60) saRelevance = "High";
      else if (saContextScore >= 40) saRelevance = "Medium";
      
      try {
        // Create an ATS score record
        const atsScore = await storage.createATSScore({
          cvId,
          score: overallScore,
          skillsScore: skillsScore,
          formatScore,
          contextScore: saContextScore,
          strengths: strengths.slice(0, 5),
          improvements: improvements.slice(0, 5),
          issues: []
        });
        
        // Send the detailed analysis response
        res.json({
          success: true,
          score: overallScore,
          scoreId: atsScore.id,
          rating: overallScore >= 80 ? "Excellent" : overallScore >= 70 ? "Very Good" : 
                 overallScore >= 60 ? "Good" : overallScore >= 50 ? "Average" : "Needs Improvement",
          strengths: strengths.slice(0, 3),
          improvements: improvements.slice(0, 3),
          skills: allSkills.slice(0, 8),
          sa_score: saContextScore,
          sa_relevance: saRelevance,
          detailed_report: {
            components: {
              skills: {
                score: skillsScore,
                high_demand_skills: foundHighDemandSkills,
                regular_skills: foundRegularSkills
              },
              format: {
                score: formatScore,
                has_sections: detectedSections.length > 0,
                sections_detected: detectedSections,
                has_bullet_points: hasBullets,
                has_date_ranges: hasDates,
                has_achievements: hasAchievements
              },
              south_african_context: {
                score: saContextScore,
                b_bbee_score: bbbeeScore,
                nqf_score: nqfScore,
                sa_locations_score: citiesScore,
                relevance: saRelevance
              }
            },
            breakdown: {
              skills_weight: "40%",
              format_weight: "40%",
              sa_context_weight: "20%"
            }
          }
        });
      } catch (error) {
        console.error("Error creating ATS score:", error);
        
        // Fallback response if database update fails
        res.json({
          success: true,
          score: overallScore,
          rating: overallScore >= 80 ? "Excellent" : overallScore >= 70 ? "Very Good" : 
                 overallScore >= 60 ? "Good" : overallScore >= 50 ? "Average" : "Needs Improvement",
          strengths: strengths.slice(0, 3),
          improvements: improvements.slice(0, 3),
          skills: allSkills.slice(0, 8),
          sa_score: saContextScore,
          sa_relevance: saRelevance
        });
      }
    } catch (error) {
      console.error("Error analyzing CV:", error);
      next(error);
    }
  });
`;

// Read the routes.ts file
let content = fs.readFileSync('routes.ts', 'utf8');

// Find the existing analyze-cv endpoint
const startPattern = /app\.post\(\"\/api\/analyze-cv\/:id\"/;
const startIndex = content.search(startPattern);

if (startIndex === -1) {
  console.error("Could not find the analyze-cv endpoint");
  process.exit(1);
}

// Find the end of the endpoint (next app.??? declaration)
let endIndex = content.indexOf("app.", startIndex + 20);
// If no next app declaration, look for the next comment
if (endIndex === -1) {
  endIndex = content.indexOf("//", startIndex + 20);
}
// If still not found, assume it ends 2000 characters later (just a safeguard)
if (endIndex === -1) {
  endIndex = startIndex + 2000;
}

// Replace the endpoint with our new implementation
const updatedContent = content.substring(0, startIndex) + newAnalyzeEndpoint + content.substring(endIndex);

// Write the updated file
fs.writeFileSync('routes.ts', updatedContent);

console.log("Successfully updated the analyze-cv endpoint");
