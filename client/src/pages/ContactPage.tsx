import { useState } from "react";
import { Helmet } from "react-helmet";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Mail, Phone } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  subject: z.string().min(5, { message: "Subject must be at least 5 characters" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
});

type ContactFormValues = z.infer<typeof formSchema>;

export default function ContactPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  function onSubmit(values: ContactFormValues) {
    setIsSubmitting(true);
    
    // Mock form submission
    setTimeout(() => {
      setIsSubmitting(false);
      form.reset();
      toast({
        title: "Message sent!",
        description: t('contact.successMessage'),
      });
    }, 1500);
  }

  return (
    <>
      <Helmet>
        <title>{t('contact.pageTitle')} | ATSBoost - South African Resume Optimization</title>
        <meta name="description" content="Get in touch with the ATSBoost team. We're here to help with any questions about our CV optimization services for South African job seekers." />
        <meta property="og:title" content="Contact ATSBoost - We're Here to Help" />
        <meta property="og:description" content="Have questions about our CV optimization services? Contact our team for support and information." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://atsboost.co.za/contact" />
      </Helmet>
      
      <div className="bg-secondary py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl max-w-2xl mx-auto">
            We're here to help with any questions about CV optimization
          </p>
        </div>
      </div>
      
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <h2 className="text-2xl font-bold text-secondary mb-6">Get in Touch</h2>
                
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-primary mr-3 mt-0.5" />
                        <div>
                          <h3 className="font-semibold mb-1">Our Location</h3>
                          <p className="text-neutral-600">Cape Town, South Africa</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <Mail className="h-5 w-5 text-primary mr-3 mt-0.5" />
                        <div>
                          <h3 className="font-semibold mb-1">Email Us</h3>
                          <p className="text-neutral-600">support@atsboost.co.za</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <Phone className="h-5 w-5 text-primary mr-3 mt-0.5" />
                        <div>
                          <h3 className="font-semibold mb-1">Call Us</h3>
                          <p className="text-neutral-600">+27 10 123 4567</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="mt-8">
                  <h3 className="font-semibold mb-2">Business Hours</h3>
                  <p className="text-neutral-600 mb-1">Monday - Friday: 8:00 AM - 5:00 PM</p>
                  <p className="text-neutral-600">Saturday - Sunday: Closed</p>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold text-secondary mb-6">Send Us a Message</h2>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject</FormLabel>
                              <FormControl>
                                <Input placeholder="Subject" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Message</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Your message" 
                                  className="min-h-[150px]" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id="consent" 
                            className="h-4 w-4 text-primary border-neutral-300 rounded"
                            required
                          />
                          <label htmlFor="consent" className="text-sm text-neutral-600">
                            I consent to ATSBoost processing my information (POPIA compliant)
                          </label>
                        </div>
                        
                        <Button 
                          type="submit" 
                          className="w-full bg-primary text-white hover:bg-opacity-90"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Sending..." : "Send Message"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-secondary mb-6">Join Our Launch Notification List</h2>
              <Card>
                <CardContent className="p-6">
                  <p className="text-neutral-600 mb-4">
                    ATSBoost is currently in pre-launch phase. Sign up to be notified when we officially launch and receive exclusive early-access offers.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Input 
                      type="email" 
                      placeholder="Your email address" 
                      className="flex-grow"
                    />
                    <Button className="bg-primary text-white hover:bg-opacity-90">
                      Notify Me at Launch
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
