 import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
 } from '@/components/ui/alert-dialog';
 import { Loader2 } from 'lucide-react';
 import { useState } from 'react';
 
 interface DeleteClientDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   onConfirm: () => Promise<void>;
   clientName: string;
 }
 
 export function DeleteClientDialog({
   open,
   onOpenChange,
   onConfirm,
   clientName,
 }: DeleteClientDialogProps) {
   const [isDeleting, setIsDeleting] = useState(false);
 
   const handleConfirm = async () => {
     setIsDeleting(true);
     try {
       await onConfirm();
       onOpenChange(false);
     } finally {
       setIsDeleting(false);
     }
   };
 
   return (
     <AlertDialog open={open} onOpenChange={onOpenChange}>
       <AlertDialogContent>
         <AlertDialogHeader>
           <AlertDialogTitle>Excluir Cliente</AlertDialogTitle>
           <AlertDialogDescription>
             Tem certeza que deseja excluir <strong>{clientName}</strong>?
             <br />
             <br />
             Esta ação irá:
             <ul className="list-disc list-inside mt-2 space-y-1">
               <li>Remover todos os dados do cliente</li>
               <li>Desconectar todas as plataformas</li>
               <li>Excluir histórico de métricas</li>
               <li>Remover a conta de usuário associada</li>
             </ul>
             <br />
             <strong className="text-destructive">
               Esta ação não pode ser desfeita.
             </strong>
           </AlertDialogDescription>
         </AlertDialogHeader>
         <AlertDialogFooter>
           <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
           <AlertDialogAction
             onClick={handleConfirm}
             disabled={isDeleting}
             className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
           >
             {isDeleting ? (
               <>
                 <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                 Excluindo...
               </>
             ) : (
               'Excluir Cliente'
             )}
           </AlertDialogAction>
         </AlertDialogFooter>
       </AlertDialogContent>
     </AlertDialog>
   );
 }