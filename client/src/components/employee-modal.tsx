import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertEmployeeSchema, insertDesignationSchema } from "@shared/schema";
import type { Employee, InsertEmployee, Designation } from "@shared/schema";
import { z } from "zod";

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee?: Employee | null;
}

const formSchema = insertEmployeeSchema.extend({
  name: z.string().min(1, "कर्मचारी का नाम आवश्यक है"),
  position: z.string().min(1, "पद आवश्यक है"),
  basic: z.number().min(1, "मूल वेतन आवश्यक है"),
  hra: z.number().min(0, "HRA 0 या उससे अधिक होना चाहिए"),
  allowance: z.number().min(0, "भत्ता 0 या उससे अधिक होना चाहिए"),
  esi_rate: z.number().min(0, "ESI दर 0 या उससे अधिक होना चाहिए"),
  pf_rate: z.number().min(0, "PF दर 0 या उससे अधिक होना चाहिए"),
  other_deduction: z.number().min(0, "अन्य कटौती 0 या उससे अधिक होना चाहिए"),
});

export default function EmployeeModal({ isOpen, onClose, employee }: EmployeeModalProps) {
  const { toast } = useToast();
  const isEditing = !!employee;
  const [showNewDesignation, setShowNewDesignation] = useState(false);
  const [newDesignationName, setNewDesignationName] = useState("");

  // Fetch designations
  const { data: designations = [], isLoading: designationsLoading } = useQuery<Designation[]>({
    queryKey: ['/api/designations'],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      position: "",
      basic: 15000,
      hra: 3000,
      allowance: 1000,
      esi_rate: 1750,
      pf_rate: 1200,
      other_deduction: 0,
      attendance: Array(31).fill('NONE'),
    },
  });

  useEffect(() => {
    if (employee) {
      form.reset({
        name: employee.name,
        position: employee.position,
        basic: employee.basic,
        hra: employee.hra,
        allowance: employee.allowance,
        esi_rate: employee.esi_rate,
        pf_rate: employee.pf_rate,
        other_deduction: employee.other_deduction,
        attendance: employee.attendance,
      });
    } else {
      form.reset({
        name: "",
        position: "",
        basic: 15000,
        hra: 3000,
        allowance: 1000,
        esi_rate: 1750,
        pf_rate: 1200,
        other_deduction: 0,
        attendance: Array(31).fill('NONE'),
      });
    }
  }, [employee, form]);

  const createDesignation = useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch("/api/designations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, isActive: 1 }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create designation");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/designations'] });
      setNewDesignationName("");
      setShowNewDesignation(false);
      toast({
        title: "नया पद जोड़ा गया",
        description: "पद सफलतापूर्वक बनाया गया",
      });
    },
    onError: (error: Error) => {
      console.error("Designation creation error:", error);
      toast({
        title: "त्रुटि",
        description: error.message || "पद बनाने में असफल",
        variant: "destructive",
      });
    },
  });

  const createEmployeeMutation = useMutation({
    mutationFn: async (data: InsertEmployee) => {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create employee");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({ title: "Success", description: "Employee created successfully" });
      onClose();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create employee", variant: "destructive" });
    },
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: async (data: InsertEmployee) => {
      const response = await fetch(`/api/employees/${employee!.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update employee");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({ title: "Success", description: "Employee updated successfully" });
      onClose();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update employee", variant: "destructive" });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (isEditing) {
      updateEmployeeMutation.mutate(data);
    } else {
      createEmployeeMutation.mutate(data);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "कर्मचारी संपादित करें" : "नया कर्मचारी जोड़ें"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "कर्मचारी की जानकारी अपडेट करें" : "नए कर्मचारी की जानकारी भरें"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>कर्मचारी का नाम</FormLabel>
                  <FormControl>
                    <Input placeholder="नाम दर्ज करें" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>पद</FormLabel>
                  <div className="space-y-2">
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="पद चुनें" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {designations.map((designation) => (
                          <SelectItem key={designation.id} value={designation.name}>
                            {designation.name}
                          </SelectItem>
                        ))}
                        <div className="border-t pt-2">
                          <div 
                            className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-gray-100"
                            onClick={() => setShowNewDesignation(true)}
                          >
                            <Plus className="h-4 w-4" />
                            <span>नया पद जोड़ें</span>
                          </div>
                        </div>
                      </SelectContent>
                    </Select>
                    
                    {showNewDesignation && (
                      <div className="flex gap-2">
                        <Input
                          placeholder="नया पद दर्ज करें"
                          value={newDesignationName}
                          onChange={(e) => setNewDesignationName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newDesignationName.trim()) {
                              createDesignation.mutate(newDesignationName.trim());
                            }
                            if (e.key === 'Escape') {
                              setShowNewDesignation(false);
                              setNewDesignationName("");
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            if (newDesignationName.trim()) {
                              createDesignation.mutate(newDesignationName.trim());
                            }
                          }}
                          disabled={!newDesignationName.trim() || createDesignation.isPending}
                        >
                          जोड़ें
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowNewDesignation(false);
                            setNewDesignationName("");
                          }}
                        >
                          रद्द करें
                        </Button>
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="basic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>मूल वेतन</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="15000"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hra"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>HRA</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="3000"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="allowance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>अन्य भत्ता</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="1000"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="esi_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ESI दर (BP)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1750"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pf_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PF दर (BP)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1200"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="other_deduction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>अन्य कटौती</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
              <p><strong>नोट:</strong> ESI और PF दर Basis Points में है (1.75% = 1750, 12% = 1200)</p>
              <p>ESI/PF 0 करके disable कर सकते हैं</p>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={createEmployeeMutation.isPending || updateEmployeeMutation.isPending}
              >
                {createEmployeeMutation.isPending || updateEmployeeMutation.isPending ? "सेव हो रहा है..." : "सेव करें"}
              </Button>
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                रद्द करें
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
