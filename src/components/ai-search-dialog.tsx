
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search, Loader2, FileText, ExternalLink, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  crossCheckStandards,
  type CrossCheckStandardsOutput,
} from '@/ai/flows/cross-check-standards';
import { Progress } from './ui/progress';

const searchSchema = z.object({
  query: z.string().min(3, 'Search query must be at least 3 characters.'),
});

export function AiSearchDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CrossCheckStandardsOutput | null>(
    null
  );

  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      query: '',
    },
  });

  async function onSubmit(values: z.infer<typeof searchSchema>) {
    setIsLoading(true);
    setResults(null);
    try {
      const searchResults = await crossCheckStandards({
        searchText: values.query,
      });
      setResults(searchResults);
    } catch (error) {
      console.error('AI Search failed:', error);
      // You could show a toast or an error message here
    }
    setIsLoading(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-sm text-muted-foreground md:w-2/3 lg:w-1/3"
        >
          <Search className="mr-2 h-4 w-4" />
          <span>Consult Scing</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Scingular AI Search</DialogTitle>
          <DialogDescription>
            Cross-reference your query against a vast library of codes and standards.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
            <FormField
              control={form.control}
              name="query"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Consult Scing."
                        className="pl-8 pr-10"
                        {...field}
                      />
                      <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full">
                          <Mic className="h-4 w-4 text-muted-foreground" />
                          <span className="sr-only">Use voice command</span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Search'
              )}
            </Button>
          </form>
        </Form>
        <div className="mt-4 space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {results && (
            <div className="max-h-[50vh] overflow-y-auto pr-4">
              {results.codeCitations?.length > 0 ? (
                <ul className="space-y-4">
                  {results.codeCitations.map((citation, index) => (
                    <li key={index} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-primary">
                          {citation}
                        </h4>
                        <span className="text-sm font-medium text-muted-foreground">
                          {results.jurisdictions?.[index]}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground italic">
                        "{results.excerpts?.[index]}"
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Relevance</span>
                            <span>
                              {((results.relevanceScores?.[index] ?? 0) * 100).toFixed(0)}%
                            </span>
                          </div>
                          <Progress
                            value={(results.relevanceScores?.[index] ?? 0) * 100}
                            className="h-2"
                          />
                        </div>

                        {results.fullDocLinks?.[index] && (
                          <Button asChild size="sm" variant="outline">
                            <a
                              href={results.fullDocLinks[index]}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View Document
                            </a>
                          </Button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                 <div className="text-center p-8 border rounded-lg">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No Results Found</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      The AI couldn't find any matching standards for your query. Try rephrasing your search.
                    </p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
