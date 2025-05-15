import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { Loader2 } from "lucide-react";

// Create a schema for job posting form
const jobPostingSchema = z.object({
  title: z.string().min(5, {
    message: "Job title must be at least 5 characters.",
  }),
  description: z.string().min(100, {
    message: "Job description must be at least 100 characters.",
  }),
  location: z.string().min(1, {
    message: "Please enter a location.",
  }),
  employmentType: z.string().min(1, {
    message: "Please select an employment type.",
  }),
  experienceLevel: z.string().min(1, {
    message: "Please select an experience level.",
  }),
  salaryRange: z.string().optional(),
  requiredSkills: z.string().min(1, {
    message: "Please enter required skills, separated by commas.",
  }),
  preferredSkills: z.string().optional(),
  industry: z.string().min(1, {
    message: "Please select an industry.",
  }),
  deadline: z.date().optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type JobPostingFormValues = z.infer<typeof jobPostingSchema>;

interface CreateJobPostingFormProps {
  onSubmit: (data: any) => void;
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
    salaryRange: "",
    requiredSkills: "",
    preferredSkills: "",
    industry: "",
    isFeatured: false,
    isActive: true,
  } 
}: CreateJobPostingFormProps) {
  // Initialize the form with default values
  const form = useForm<JobPostingFormValues>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues,
  });

  const handleSubmit = (data: JobPostingFormValues) => {
    // Process the skills into arrays
    const processedData = {
      ...data,
      requiredSkills: data.requiredSkills.split(',').map(skill => skill.trim()),
      preferredSkills: data.preferredSkills ? data.preferredSkills.split(',').map(skill => skill.trim()) : [],
    };

    onSubmit(processedData);
  };

  // Industry options for South Africa
  const industries = [
    "Agriculture, Forestry & Fishing",
    "Mining & Quarrying",
    "Manufacturing",
    "Electricity, Gas & Water",
    "Construction",
    "Wholesale & Retail Trade",
    "Transport & Communication",
    "Financial & Business Services",
    "Community & Social Services",
    "Government Services",
    "Information Technology",
    "Healthcare & Pharmaceuticals",
    "Education",
    "Tourism & Hospitality",
    "Media & Entertainment",
    "Legal Services",
    "Telecommunications",
    "Real Estate",
    "Consulting",
    "Non-profit & NGO",
    "Other"
  ];

  // Employment type options
  const employmentTypes = [
    "Full-time",
    "Part-time",
    "Contract",
    "Temporary",
    "Internship",
    "Volunteer",
    "Remote"
  ];

  // Experience level options
  const experienceLevels = [
    "Entry Level",
    "Junior",
    "Mid Level",
    "Senior",
    "Executive",
    "Student"
  ];

  // Salary range options
  const salaryRanges = [
    "R0 - R10,000 per month",
    "R10,000 - R20,000 per month",
    "R20,000 - R30,000 per month",
    "R30,000 - R40,000 per month",
    "R40,000 - R50,000 per month",
    "R50,000+ per month",
    "Negotiable"
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Job Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="e.g. Software Developer, Marketing Manager" {...field} />
              </FormControl>
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
              <FormLabel>Industry <span className="text-red-500">*</span></FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an industry" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                <FormLabel>Location <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Cape Town, Johannesburg, Remote" {...field} />
                </FormControl>
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
                <FormLabel>Employment Type <span className="text-red-500">*</span></FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {employmentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
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
                <FormLabel>Experience Level <span className="text-red-500">*</span></FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Salary Range */}
          <FormField
            control={form.control}
            name="salaryRange"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salary Range</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select salary range" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {salaryRanges.map((range) => (
                      <SelectItem key={range} value={range}>
                        {range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Job Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Description <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter a detailed job description including responsibilities, requirements, benefits, etc." 
                  className="min-h-[200px]"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                {field.value?.length || 0}/5000 characters (minimum 100)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Required Skills */}
          <FormField
            control={form.control}
            name="requiredSkills"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Required Skills <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="e.g. JavaScript, React, Node.js" 
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Separate skills with commas
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Preferred Skills */}
          <FormField
            control={form.control}
            name="preferredSkills"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Skills</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="e.g. TypeScript, AWS, Docker" 
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Separate skills with commas
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Application Deadline */}
        <FormField
          control={form.control}
          name="deadline"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Application Deadline</FormLabel>
              <DatePicker 
                date={field.value} 
                setDate={(date) => field.onChange(date)}
              />
              <FormDescription>
                Leave blank for no deadline
              </FormDescription>
              <FormMessage />
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
                  Feature this job posting
                </FormLabel>
                <FormDescription>
                  Featured job postings appear at the top of search results and receive more visibility.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {/* Active Job */}
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
                  Set job as active
                </FormLabel>
                <FormDescription>
                  Active jobs are visible to job seekers. Inactive jobs are only visible to you.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Post Job
          </Button>
        </div>
      </form>
    </Form>
  );
}