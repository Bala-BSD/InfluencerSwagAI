import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { ArrowRight } from "lucide-react";

const formSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  productDescription: z.string().min(10, "Description must be at least 10 characters"),
  targetAudience: z.string().min(5, "Target audience is required"),
  brandVoice: z.string().min(5, "Brand voice description is required"),
});

type FormData = z.infer<typeof formSchema>;

interface ProductDefinitionFormProps {
  onSubmit: (data: FormData) => void;
  defaultValues?: Partial<FormData>;
}

export function ProductDefinitionForm({ onSubmit, defaultValues }: ProductDefinitionFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: defaultValues?.productName || "",
      productDescription: defaultValues?.productDescription || "",
      targetAudience: defaultValues?.targetAudience || "",
      brandVoice: defaultValues?.brandVoice || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="productName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product/Service Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., EcoFlex Activewear"
                    data-testid="input-product-name"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  The name of your product or service
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="targetAudience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Audience</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Health-conscious millennials"
                    data-testid="input-target-audience"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Who is your ideal customer?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="productDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your product, its key features, benefits, and what makes it unique..."
                  className="min-h-32 resize-none"
                  data-testid="input-product-description"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide details about what makes your product special
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="brandVoice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand Voice & Personality</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Empowering, authentic, solution-oriented. We speak to our community like friends who genuinely care..."
                  className="min-h-24 resize-none"
                  data-testid="input-brand-voice"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Describe your brand's tone and communication style
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            size="lg"
            className="gap-2"
            data-testid="button-continue-product"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
}
