 import { useState, useEffect } from 'react';
 import { useForm } from 'react-hook-form';
 import { zodResolver } from '@hookform/resolvers/zod';
 import { z } from 'zod';
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogDescription,
 } from '@/components/ui/dialog';
 import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
 } from '@/components/ui/form';
 import { Input } from '@/components/ui/input';
 import { Button } from '@/components/ui/button';
 import { Textarea } from '@/components/ui/textarea';
 import { Switch } from '@/components/ui/switch';
 import { Loader2 } from 'lucide-react';
 
 const clientFormSchema = z.object({
   email: z
     .string()
     .trim()
     .email({ message: 'E-mail inválido' })
     .max(255, { message: 'E-mail deve ter no máximo 255 caracteres' }),
   password: z
     .string()
     .min(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
     .max(72, { message: 'Senha deve ter no máximo 72 caracteres' })
     .optional()
     .or(z.literal('')),
   fullName: z
     .string()
     .trim()
     .min(1, { message: 'Nome é obrigatório' })
     .max(100, { message: 'Nome deve ter no máximo 100 caracteres' }),
   companyName: z
     .string()
     .trim()
     .min(1, { message: 'Nome da empresa é obrigatório' })
     .max(100, { message: 'Nome da empresa deve ter no máximo 100 caracteres' }),
   whatsapp: z
     .string()
     .trim()
     .max(20, { message: 'WhatsApp deve ter no máximo 20 caracteres' })
     .optional()
     .or(z.literal('')),
   adminWhatsapp: z
     .string()
     .trim()
     .max(20, { message: 'WhatsApp admin deve ter no máximo 20 caracteres' })
     .optional()
     .or(z.literal('')),
   monthlyGoal: z
     .union([z.string(), z.number()])
     .optional()
     .transform((val) => {
       if (val === '' || val === undefined || val === null) return null;
       return typeof val === 'number' ? val : parseFloat(val);
     }),
   notes: z
     .string()
     .trim()
     .max(1000, { message: 'Notas devem ter no máximo 1000 caracteres' })
     .optional()
     .or(z.literal('')),
  weeklyReportEnabled: z.boolean().default(true),
  contentApprovalUrl: z
    .string()
    .trim()
    .url({ message: 'URL inválida' })
    .max(500, { message: 'URL deve ter no máximo 500 caracteres' })
    .optional()
    .or(z.literal('')),
});
 
 // Input type for the form (before transform)
 type ClientFormInput = {
   email: string;
   password?: string;
   fullName: string;
   companyName: string;
   whatsapp?: string;
   adminWhatsapp?: string;
   monthlyGoal?: string | number;
   notes?: string;
  weeklyReportEnabled: boolean;
  contentApprovalUrl?: string;
};
 
 // Output type after transform (what onSubmit receives)
 export type ClientFormData = z.output<typeof clientFormSchema>;
 
 interface ClientFormDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   onSubmit: (data: ClientFormData) => Promise<void>;
   initialData?: Partial<ClientFormData> & { id?: string };
   mode: 'create' | 'edit';
 }
 
 export function ClientFormDialog({
   open,
   onOpenChange,
   onSubmit,
   initialData,
   mode,
 }: ClientFormDialogProps) {
   const [isSubmitting, setIsSubmitting] = useState(false);
 
 const form = useForm<ClientFormInput>({
     resolver: zodResolver(clientFormSchema),
     defaultValues: {
       email: '',
       password: '',
       fullName: '',
       companyName: '',
       whatsapp: '',
       adminWhatsapp: '',
       monthlyGoal: '',
        notes: '',
        weeklyReportEnabled: true,
        contentApprovalUrl: '',
      },
    });
  
    useEffect(() => {
      if (open && initialData) {
        form.reset({
          email: initialData.email || '',
          password: '',
          fullName: initialData.fullName || '',
          companyName: initialData.companyName || '',
          whatsapp: initialData.whatsapp || '',
          adminWhatsapp: initialData.adminWhatsapp || '',
          monthlyGoal: initialData.monthlyGoal?.toString() || '',
          notes: initialData.notes || '',
          weeklyReportEnabled: initialData.weeklyReportEnabled ?? true,
          contentApprovalUrl: initialData.contentApprovalUrl || '',
       });
     } else if (open) {
       form.reset({
         email: '',
         password: '',
         fullName: '',
         companyName: '',
         whatsapp: '',
         adminWhatsapp: '',
         monthlyGoal: '',
         notes: '',
          weeklyReportEnabled: true,
          contentApprovalUrl: '',
       });
     }
   }, [open, initialData, form]);
 
 const handleSubmit = async (data: ClientFormInput) => {
     const transformedData = clientFormSchema.parse(data);
     setIsSubmitting(true);
     try {
 await onSubmit(transformedData);
       onOpenChange(false);
     } finally {
       setIsSubmitting(false);
     }
   };
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
         <DialogHeader>
           <DialogTitle>
             {mode === 'create' ? 'Novo Cliente' : 'Editar Cliente'}
           </DialogTitle>
           <DialogDescription>
             {mode === 'create'
               ? 'Preencha os dados para criar um novo cliente.'
               : 'Atualize os dados do cliente.'}
           </DialogDescription>
         </DialogHeader>
 
         <Form {...form}>
           <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
               <FormField
                 control={form.control}
                 name="fullName"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Nome Completo</FormLabel>
                     <FormControl>
                       <Input placeholder="João Silva" {...field} />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
               <FormField
                 control={form.control}
                 name="companyName"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Empresa</FormLabel>
                     <FormControl>
                       <Input placeholder="Empresa LTDA" {...field} />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
             </div>
 
             <FormField
               control={form.control}
               name="email"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>E-mail</FormLabel>
                   <FormControl>
                     <Input
                       type="email"
                       placeholder="cliente@email.com"
                       {...field}
                       disabled={mode === 'edit'}
                     />
                   </FormControl>
                   <FormMessage />
                 </FormItem>
               )}
             />
 
             {mode === 'create' && (
               <FormField
                 control={form.control}
                 name="password"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Senha</FormLabel>
                     <FormControl>
                       <Input
                         type="password"
                         placeholder="Mínimo 6 caracteres"
                         {...field}
                       />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
             )}
 
             <div className="grid grid-cols-2 gap-4">
               <FormField
                 control={form.control}
                 name="whatsapp"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>WhatsApp Cliente</FormLabel>
                     <FormControl>
                       <Input placeholder="+5511999999999" {...field} />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
               <FormField
                 control={form.control}
                 name="adminWhatsapp"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>WhatsApp Admin</FormLabel>
                     <FormControl>
                       <Input placeholder="+5511999999999" {...field} />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
             </div>
 
             <FormField
               control={form.control}
               name="monthlyGoal"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>Meta Mensal (R$)</FormLabel>
                   <FormControl>
                     <Input
                       type="number"
                       step="0.01"
                       placeholder="10000.00"
                       {...field}
                     />
                   </FormControl>
                   <FormMessage />
                 </FormItem>
               )}
              />

              <FormField
                control={form.control}
                name="contentApprovalUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link de Aprovação de Conteúdo</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
 
             <FormField
               control={form.control}
               name="notes"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>Notas Internas</FormLabel>
                   <FormControl>
                     <Textarea
                       placeholder="Observações sobre o cliente..."
                       className="resize-none"
                       rows={3}
                       {...field}
                     />
                   </FormControl>
                   <FormMessage />
                 </FormItem>
               )}
             />
 
             <FormField
               control={form.control}
               name="weeklyReportEnabled"
               render={({ field }) => (
                 <FormItem className="flex items-center justify-between rounded-lg border p-3">
                   <div className="space-y-0.5">
                     <FormLabel>Relatório Semanal</FormLabel>
                     <p className="text-sm text-muted-foreground">
                       Enviar relatório automático toda semana
                     </p>
                   </div>
                   <FormControl>
                     <Switch
                       checked={field.value}
                       onCheckedChange={field.onChange}
                     />
                   </FormControl>
                 </FormItem>
               )}
             />
 
             <div className="flex justify-end gap-3 pt-4">
               <Button
                 type="button"
                 variant="outline"
                 onClick={() => onOpenChange(false)}
                 disabled={isSubmitting}
               >
                 Cancelar
               </Button>
               <Button type="submit" disabled={isSubmitting}>
                 {isSubmitting ? (
                   <>
                     <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                     {mode === 'create' ? 'Criando...' : 'Salvando...'}
                   </>
                 ) : mode === 'create' ? (
                   'Criar Cliente'
                 ) : (
                   'Salvar Alterações'
                 )}
               </Button>
             </div>
           </form>
         </Form>
       </DialogContent>
     </Dialog>
   );
 }