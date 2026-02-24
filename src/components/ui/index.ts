// Re-exports de todos os componentes UI do Design System
// Importe de: import { Button, Card, Input, Badge } from '@/src/components/ui'

export { Button } from './button';
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
export { Input } from './input';
export { Badge } from './badge';
export { Label } from './label';
export { Toaster } from './sonner';
export { Avatar, AvatarImage, AvatarFallback } from './avatar';
export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from './dialog';
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './dropdown-menu';
export { ScrollArea } from './scroll-area';
export { Separator } from './separator';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';

// Estado global — Loading, Empty, Error
export { LoadingState, EmptyState, ErrorState } from './states';
