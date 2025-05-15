import React from 'react';
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
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define form schema for employer profiles
const employerFormSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Industry is required"),
  description: z.string().min(10, "Description should be at least 10 characters"),
  websiteUrl: z.string().url("Must be a valid URL").or(z.literal("")),
  location: z.string().min(1, "Location is required"),
  size: z.string().min(1, "Company size is required"),
  bbbeeLevel: z.string().optional(),
  contactEmail: z.string().email("Must be a valid email address"),
  contactPhone: z.string().optional(),
});

type EmployerFormValues = z.infer<typeof employerFormSchema>;

interface CreateEmployerProfileFormProps {
  onSubmit: (data: EmployerFormValues) => void;
  isSubmitting: boolean;
  defaultValues?: Partial<EmployerFormValues>;
}

export function CreateEmployerProfileForm({
  onSubmit,
  isSubmitting,
  defaultValues = {
    companyName: "",
    industry: "",
    description: "",
    websiteUrl: "",
    location: "",
    size: "",
    bbbeeLevel: "",
    contactEmail: "",
    contactPhone: "",
  },
}: CreateEmployerProfileFormProps) {
  // Initialize form
  const form = useForm<EmployerFormValues>({
    resolver: zodResolver(employerFormSchema),
    defaultValues,
  });

  // Handle form submission
  const handleSubmit = (values: EmployerFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Name */}
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter company name" {...field} />
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

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Description *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Briefly describe your company, culture, and what makes you a great place to work"
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This will be shown to job seekers when they view your company profile.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Website URL */}
          <FormField
            control={form.control}
            name="websiteUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://www.example.com" {...field} />
                </FormControl>
                <FormDescription>
                  Your company's official website
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

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
                <FormDescription>
                  Primary location or headquarters
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Size */}
          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Size *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-500">201-500 employees</SelectItem>
                    <SelectItem value="501-1000">501-1000 employees</SelectItem>
                    <SelectItem value="1001-5000">1001-5000 employees</SelectItem>
                    <SelectItem value="5001+">5001+ employees</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* B-BBEE Level */}
          <FormField
            control={form.control}
            name="bbbeeLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>B-BBEE Level</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select B-BBEE level (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="level_1">Level 1</SelectItem>
                    <SelectItem value="level_2">Level 2</SelectItem>
                    <SelectItem value="level_3">Level 3</SelectItem>
                    <SelectItem value="level_4">Level 4</SelectItem>
                    <SelectItem value="level_5">Level 5</SelectItem>
                    <SelectItem value="level_6">Level 6</SelectItem>
                    <SelectItem value="level_7">Level 7</SelectItem>
                    <SelectItem value="level_8">Level 8</SelectItem>
                    <SelectItem value="non_compliant">Non-Compliant</SelectItem>
                    <SelectItem value="exempt">Exempt</SelectItem>
                    <SelectItem value="not_applicable">Not Applicable</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Your company's B-BBEE status level
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Email */}
          <FormField
            control={form.control}
            name="contactEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Email *</FormLabel>
                <FormControl>
                  <Input placeholder="hr@example.com" {...field} />
                </FormControl>
                <FormDescription>
                  Primary email for job applications and inquiries
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Contact Phone */}
          <FormField
            control={form.control}
            name="contactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+27 12 345 6789" {...field} />
                </FormControl>
                <FormDescription>
                  Optional phone number for inquiries
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Create Employer Profile"
          )}
        </Button>
      </form>
    </Form>
  );
}