import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const COLLEGES = [
  "VBIT", "Aurora's Engineering College", "Sreenidhi Institute of Science and Technology",
  "Anurag University", "ACE Engineering College", "JNTU Hyderabad", "Osmania University",
  "CBIT", "MGIT", "Vasavi College of Engineering"
];

const YEARS = ["I", "II", "III", "IV"];

const BRANCHES = [
  "Computer Science Engineering", "Electronics and Communication Engineering",
  "Electrical and Electronics Engineering", "Mechanical Engineering",
  "Civil Engineering", "Information Technology", "Chemical Engineering",
  "Aerospace Engineering", "Biotechnology"
];

const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  studentId: z.string().min(4, "Student ID must be at least 4 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  college: z.string().min(1, "Please select your college"),
  year: z.string().min(1, "Please select your year"),
  branch: z.string().min(1, "Please select your branch"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      studentId: "",
      firstName: "",
      lastName: "",
      college: "",
      year: "",
      branch: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful!",
        description: "Welcome to Vroomie! You can now start using the app.",
      });
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Join Vroomie</CardTitle>
          <p className="text-gray-600">Create your student account</p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} data-testid="input-firstName" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} data-testid="input-lastName" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="john.doe@college.edu" 
                        {...field} 
                        data-testid="input-email"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student ID</FormLabel>
                    <FormControl>
                      <Input placeholder="20CS001" {...field} data-testid="input-studentId" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="college"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>College</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger data-testid="select-college">
                          <SelectValue placeholder="Select your college" />
                        </SelectTrigger>
                        <SelectContent>
                          {COLLEGES.map((college) => (
                            <SelectItem key={college} value={college}>
                              {college}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger data-testid="select-year">
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {YEARS.map((year) => (
                              <SelectItem key={year} value={year}>
                                {year} Year
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger data-testid="select-branch">
                            <SelectValue placeholder="Branch" />
                          </SelectTrigger>
                          <SelectContent>
                            {BRANCHES.map((branch) => (
                              <SelectItem key={branch} value={branch}>
                                {branch}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={registerMutation.isPending}
                data-testid="button-register"
              >
                {registerMutation.isPending ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}