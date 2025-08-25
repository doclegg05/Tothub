// Example: TotHub React Component Pattern
// This demonstrates the standard pattern for creating React components in TotHub

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/queryClient';

// 1. Define validation schema
const enrollChildSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  parentName: z.string().min(1, 'Parent name is required'),
  parentPhone: z.string().min(10, 'Valid phone number required'),
});

type EnrollChildData = z.infer<typeof enrollChildSchema>;

// 2. Component following TotHub patterns
export function EnrollChildForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 3. Use React Hook Form with Zod validation
  const form = useForm<EnrollChildData>({
    resolver: zodResolver(enrollChildSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      parentName: '',
      parentPhone: '',
    },
  });

  // 4. Use TanStack Query mutation
  const enrollMutation = useMutation({
    mutationFn: (data: EnrollChildData) => 
      apiRequest('/api/children', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      // 5. Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['children'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      
      // 6. Show success toast
      toast({
        title: 'Success',
        description: 'Child enrolled successfully',
      });
      
      // 7. Reset form and call callback
      form.reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      // 8. Handle errors with toast
      toast({
        title: 'Error',
        description: error.message || 'Failed to enroll child',
        variant: 'destructive',
      });
    },
  });

  // 9. Handle form submission
  const onSubmit = async (data: EnrollChildData) => {
    setIsSubmitting(true);
    try {
      await enrollMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 10. Render form with shadcn/ui components
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter first name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Additional fields follow same pattern... */}
        
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enrolling...' : 'Enroll Child'}
        </Button>
      </form>
    </Form>
  );
}