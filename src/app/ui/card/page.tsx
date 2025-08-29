import React from 'react';
import Card from '@/components/ui/card';

const CardExamples = () => {
  return (
    <section className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Card Examples</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card
          description="This is a basic card with a shadow."
          variant="basic"
        />

        <Card
          description="This card has an outlined border."
          variant="outlined"
        />

        <Card
          description="This card has an elevated shadow."
          variant="elevated"
        />

        <Card
          description="This card includes a footer section."
          footer={<button className="bg-blue-500 text-white px-4 py-2 rounded">Action</button>}
        />
      </div>
    </section>
  );
};

export default CardExamples;
