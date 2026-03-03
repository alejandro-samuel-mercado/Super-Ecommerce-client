"use client";

import { faq as faqContent } from "@/../content/faq";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const filteredCategories = faqContent.categories
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (q) =>
          searchQuery === "" ||
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((category) => category.questions.length > 0);

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <main className="min-h-screen  pb-60 pt-20 max-md:pt-0 ">
      <div className="relative pt-16 overflow-hidden ">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent -z-10 " />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50 -z-10 animate-pulse " />

        <div className=" mx-auto px-4  max-md:px-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-[0.9] text-zinc-900 dark:text-zinc-50">
              {faqContent.title}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
              {faqContent.subtitle}
            </p>

            <div className="relative max-w-xl mx-auto mt-12 group">
              <div className="absolute inset-0 bg-primary/20 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity -z-10 rounded-full" />
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder={faqContent.search.placeholder}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-14 h-14 rounded-[2rem] border-2 border-zinc-400 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl shadow-zinc-200/50 dark:shadow-none focus-visible:ring-primary/20 transition-all text-lg font-bold"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl  max-md:px-10  max-sm:px-3">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-32 bg-white dark:bg-zinc-900 rounded-[3rem] border-4 border-dashed border-zinc-100 dark:border-zinc-800">
            <div className="bg-zinc-100 dark:bg-zinc-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 italic">
              No encontramos respuestas para esa búsqueda...
            </p>
            <Button
              variant="ghost"
              className="mt-6 rounded-full font-black text-xs uppercase"
              onClick={() => setSearchQuery("")}
            >
              Ver todas las preguntas
            </Button>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
              {paginatedCategories.map((category) => (
                <section
                  key={category.id}
                  className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border-2 border-zinc-300 dark:border-zinc-800 shadow-xl shadow-zinc-400/60 dark:shadow-none flex flex-col hover:scale-105 hover:border-primary/30 transition-all duration-500"
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-black text-2xl uppercase">
                        {category.title.charAt(0)}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">
                      {category.title}
                    </h2>
                  </div>

                  <Accordion
                    type="single"
                    collapsible
                    className="space-y-4 w-full"
                  >
                    {category.questions.map((item, idx) => (
                      <AccordionItem
                        key={idx}
                        value={`${category.id}-${idx}`}
                        className="border-2 border-zinc-50 dark:border-zinc-800/50 rounded-2xl px-6 transition-all data-[state=open]:border-primary/20 data-[state=open]:bg-zinc-50/50 dark:data-[state=open]:bg-zinc-800/30 overflow-hidden"
                      >
                        <AccordionTrigger className="text-left font-bold text-zinc-800 dark:text-zinc-200 hover:no-underline group py-5">
                          <span className="group-hover:text-primary transition-colors">
                            {item.question}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed pb-6 pr-4">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 pt-12">
                <Button
                  variant="secondary"
                  disabled={currentPage === 1}
                  className="rounded-2xl h-12 w-12 p-0 font-black shadow-lg shadow-zinc-200"
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                >
                  &lt;
                </Button>
                <span className="font-black text-sm uppercase tracking-widest text-zinc-400">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="secondary"
                  disabled={currentPage === totalPages}
                  className="rounded-2xl h-12 w-12 p-0 font-black shadow-lg shadow-zinc-200"
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  &gt;
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
