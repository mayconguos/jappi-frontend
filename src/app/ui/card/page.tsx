import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const CardExamples = () => {
  return (
    <section className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Card Examples</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Basic Card */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Card</CardTitle>
            <CardDescription>This is a basic card with a shadow.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card content goes here.</p>
          </CardContent>
        </Card>

        {/* Outlined/Flat Card (using flat variant as closest to 'outlined' or default with border) */}
        <Card variant="flat">
          <CardHeader>
            <CardTitle>Flat Card</CardTitle>
            <CardDescription>This card has a flat style.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>It uses the "flat" variant.</p>
          </CardContent>
        </Card>

        {/* Hoverable Card */}
        <Card isHoverable>
          <CardHeader>
            <CardTitle>Hoverable Card</CardTitle>
            <CardDescription>This card has a hover effect.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Hover over me!</p>
          </CardContent>
        </Card>

        {/* Card with Footer */}
        <Card>
          <CardHeader>
            <CardTitle>Card with Footer</CardTitle>
            <CardDescription>This card includes a footer section.</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <p>The footer is below.</p>
          </CardContent>
          <CardFooter>
            <Button>Action</Button>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
};

export default CardExamples;
