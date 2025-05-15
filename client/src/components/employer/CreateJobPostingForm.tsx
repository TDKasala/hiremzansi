import React, { useState } from 'react';
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { Loader2, Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Define form schema for job postings
const jobPostingSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  description: z.string().min(20, "Description should be at least 20 characters"),
  location: z.string().min(1, "Location is required"),
  employmentType: z.string().min(1, "Employment type is required"),
  experienceLevel: z.string().min(1, "Experience level is required"),
  industry: z.string().min(1, "Industry is required"),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  salaryRange: z.string().optional(),
  requiredSkills: z.array(z.string()).optional(),
  preferredSkills: z.array(z.string()).optional(),
  bbbeeLevel: z.string().optional(),
  educationLevel: z.string().optional(),
  applicationEmail: z.string().email("Must be a valid email address").optional(),
  applicationUrl: z.string().url("Must be a valid URL").optional(),
});

type JobPostingFormValues = z.infer<typeof jobPostingSchema>;

interface CreateJobPostingFormProps {
  onSubmit: (data: JobPostingFormValues & { deadline?: string }) => void;
  isSubmitting: boolean;
  defaultValues?: Partial<JobPostingFormValues>;
}

export function CreateJobPostingForm({
  onSubmit,
  isSubmitting,
  defaultValues = {
    title: "",
    description: "",
    location: "",
    employmentType: "",
    experienceLevel: "",
    industry: "",
    isActive: true,
    isFeatured: false,
    salaryRange: "",
    requiredSkills: [],
    preferredSkills: [],
    bbbeeLevel: "",
    educationLevel: "",
    applicationEmail: "",
    applicationUrl: "",
  },
}: CreateJobPostingFormProps) {
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [requiredSkillInput, setRequiredSkillInput] = useState("");
  const [preferredSkillInput, setPreferredSkillInput] = useState("");

  // Initialize form
  const form = useForm<JobPostingFormValues>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues,
  });

  // Handle form submission
  const handleSubmit = (values: JobPostingFormValues) => {
    onSubmit({
      ...values,
      deadline: deadline ? deadline.toISOString() : undefined,
    });
  };

  // Add required skill
  const addRequiredSkill = () => {
    if (!requiredSkillInput.trim()) return;
    
    const currentSkills = form.getValues("requiredSkills") || [];
    if (!currentSkills.includes(requiredSkillInput.trim())) {
      form.setValue("requiredSkills", [...currentSkills, requiredSkillInput.trim()]);
    }
    setRequiredSkillInput("");
  };

  // Remove required skill
  const removeRequiredSkill = (skill: string) => {
    const currentSkills = form.getValues("requiredSkills") || [];
    form.setValue(
      "requiredSkills",
      currentSkills.filter((s) => s !== skill)
    );
  };

  // Add preferred skill
  const addPreferredSkill = () => {
    if (!preferredSkillInput.trim()) return;
    
    const currentSkills = form.getValues("preferredSkills") || [];
    if (!currentSkills.includes(preferredSkillInput.trim())) {
      form.setValue("preferredSkills", [...currentSkills, preferredSkillInput.trim()]);
    }
    setPreferredSkillInput("");
  };

  // Remove preferred skill
  const removePreferredSkill = (skill: string) => {
    const currentSkills = form.getValues("preferredSkills") || [];
    form.setValue(
      "preferredSkills",
      currentSkills.filter((s) => s !== skill)
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Job Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title *</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Senior Software Engineer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Description *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the responsibilities, requirements, and benefits of the position"
                  className="min-h-[200px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Use clear, specific details about the role and your company.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location */}
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="gauteng">Gauteng</SelectItem>
                    <SelectItem value="western_cape">Western Cape</SelectItem>
                    <SelectItem value="kwazulu_natal">KwaZulu-Natal</SelectItem>
                    <SelectItem value="eastern_cape">Eastern Cape</SelectItem>
                    <SelectItem value="free_state">Free State</SelectItem>
                    <SelectItem value="north_west">North West</SelectItem>
                    <SelectItem value="mpumalanga">Mpumalanga</SelectItem>
                    <SelectItem value="limpopo">Limpopo</SelectItem>
                    <SelectItem value="northern_cape">Northern Cape</SelectItem>
                    <SelectItem value="multiple">Multiple Locations</SelectItem>
                    <SelectItem value="remote">Remote (South Africa)</SelectItem>
                    <SelectItem value="international">International</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Employment Type */}
          <FormField
            control={form.control}
            name="employmentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employment Type *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="full_time">Full-time</SelectItem>
                    <SelectItem value="part_time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="volunteer">Volunteer</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Experience Level */}
          <FormField
            control={form.control}
            name="experienceLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Experience Level *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="entry_level">Entry Level</SelectItem>
                    <SelectItem value="junior">Junior (1-3 years)</SelectItem>
                    <SelectItem value="mid_level">Mid-Level (3-5 years)</SelectItem>
                    <SelectItem value="senior">Senior (5-8 years)</SelectItem>
                    <SelectItem value="expert">Expert (8+ years)</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Industry */}
          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industry *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="information_technology">Information Technology</SelectItem>
                    <SelectItem value="finance">Finance & Banking</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="hospitality">Hospitality & Tourism</SelectItem>
                    <SelectItem value="construction">Construction</SelectItem>
                    <SelectItem value="agriculture">Agriculture</SelectItem>
                    <SelectItem value="mining">Mining</SelectItem>
                    <SelectItem value="media">Media & Communications</SelectItem>
                    <SelectItem value="transport">Transportation & Logistics</SelectItem>
                    <SelectItem value="energy">Energy & Utilities</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="nonprofit">Non-profit</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Salary Range */}
          <FormField
            control={form.control}
            name="salaryRange"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salary Range</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. R30,000 - R45,000 per month" {...field} />
                </FormControl>
                <FormDescription>
                  Optional but recommended for better candidate matching
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Education Level */}
          <FormField
            control={form.control}
            name="educationLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Education Level</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select education level (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="high_school">High School/Matric</SelectItem>
                    <SelectItem value="certificate">Certificate (NQF 2-4)</SelectItem>
                    <SelectItem value="diploma">Diploma (NQF 5-6)</SelectItem>
                    <SelectItem value="bachelor">Bachelor's Degree (NQF 7)</SelectItem>
                    <SelectItem value="honours">Honours Degree (NQF 8)</SelectItem>
                    <SelectItem value="masters">Master's Degree (NQF 9)</SelectItem>
                    <SelectItem value="doctorate">Doctorate (NQF 10)</SelectItem>
                    <SelectItem value="professional">Professional Qualification</SelectItem>
                    <SelectItem value="not_required">Not Required</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* B-BBEE Level */}
        <FormField
          control={form.control}
          name="bbbeeLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>B-BBEE Requirements</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select B-BBEE requirements (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="level_1">Level 1 Required</SelectItem>
                  <SelectItem value="level_2">Level 2 or better</SelectItem>
                  <SelectItem value="level_3">Level 3 or better</SelectItem>
                  <SelectItem value="level_4">Level 4 or better</SelectItem>
                  <SelectItem value="any_level">Any Level</SelectItem>
                  <SelectItem value="eepolicy">EE Policy Applies</SelectItem>
                  <SelectItem value="not_applicable">Not Applicable</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Any B-BBEE requirements for applicants
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Deadline */}
        <div className="space-y-2">
          <FormLabel>Application Deadline</FormLabel>
          <DatePicker date={deadline} setDate={setDeadline} />
          <FormDescription>
            Leave blank if there's no specific deadline
          </FormDescription>
        </div>

        {/* Required Skills */}
        <div className="space-y-2">
          <FormLabel>Required Skills</FormLabel>
          <div className="flex gap-2">
            <Input
              value={requiredSkillInput}
              onChange={(e) => setRequiredSkillInput(e.target.value)}
              placeholder="Add a required skill"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addRequiredSkill();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={addRequiredSkill}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {(form.watch("requiredSkills") || []).map((skill) => (
              <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                {skill}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeRequiredSkill(skill)}
                />
              </Badge>
            ))}
            {(!(form.watch("requiredSkills")) || (form.watch("requiredSkills") || []).length === 0) && (
              <span className="text-sm text-muted-foreground">No required skills added yet</span>
            )}
          </div>
        </div>

        {/* Preferred Skills */}
        <div className="space-y-2">
          <FormLabel>Preferred Skills</FormLabel>
          <div className="flex gap-2">
            <Input
              value={preferredSkillInput}
              onChange={(e) => setPreferredSkillInput(e.target.value)}
              placeholder="Add a preferred skill"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addPreferredSkill();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={addPreferredSkill}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {(form.watch("preferredSkills") || []).map((skill) => (
              <Badge key={skill} variant="outline" className="flex items-center gap-1">
                {skill}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removePreferredSkill(skill)}
                />
              </Badge>
            ))}
            {(!(form.watch("preferredSkills")) || (form.watch("preferredSkills") || []).length === 0) && (
              <span className="text-sm text-muted-foreground">No preferred skills added yet</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Application Email */}
          <FormField
            control={form.control}
            name="applicationEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Application Email</FormLabel>
                <FormControl>
                  <Input placeholder="recruiting@example.com" {...field} />
                </FormControl>
                <FormDescription>
                  Email where applications will be sent
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Application URL */}
          <FormField
            control={form.control}
            name="applicationUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>External Application URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://careers.example.com/apply" {...field} />
                </FormControl>
                <FormDescription>
                  External website for applications
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          {/* Job Status */}
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Active Job Posting
                  </FormLabel>
                  <FormDescription>
                    Make this job visible to candidates immediately
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {/* Featured Job */}
          <FormField
            control={form.control}
            name="isFeatured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Featured Job
                  </FormLabel>
                  <FormDescription>
                    Highlight this job in search results and on the homepage
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Job Posting...
            </>
          ) : (
            "Create Job Posting"
          )}
        </Button>
      </form>
    </Form>
  );
}