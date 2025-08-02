import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { insertEmployeeSchema } from "@shared/schema";
import type { Employee, InsertEmployee } from "@shared/schema";
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
});

export default function EmployeeModal({ isOpen, onClose, employee }: EmployeeModalProps) {
  const { toast } = useToast();
  const isEditing = !!employee;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      position: "",
      basic: 15000,
      hra: 3000,
      allowance: 1000,
      attendance: Array(31).fill('P'),
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
        attendance: employee.attendance,
      });
    } else {
      form.reset({
        name: "",
        position: "",
        basic: 15000,
        hra: 3000,
        allowance: 1000,
        attendance: Array(31).fill('P'),
      });
    }
  }, [employee, form]);

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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="पद चुनें" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Assistant">Assistant</SelectItem>
                      <SelectItem value="Worker">Worker</SelectItem>
                      <SelectItem value="Supervisor">Supervisor</SelectItem>
                    </SelectContent>
                  </Select>
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
