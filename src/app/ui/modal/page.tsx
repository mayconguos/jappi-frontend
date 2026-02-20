"use client";

import { useState } from "react";
import Modal, { ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

export default function ModalExamples() {
  const [isSmallModalOpen, setSmallModalOpen] = useState(false);
  const [isLargeModalOpen, setLargeModalOpen] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Modal Examples</h1>

      {/* Ejemplo de Modal Pequeño */}
      <div>
        <Button onClick={() => setSmallModalOpen(true)} className="bg-primary text-white">
          Open Small Modal
        </Button>
        <Modal
          isOpen={isSmallModalOpen}
          onClose={() => setSmallModalOpen(false)}
          title="Small Modal"
          size="sm"
        >
          <p>This is a small modal example.</p>
          <ModalFooter>
            <Button
              onClick={() => setSmallModalOpen(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white"
            >
              Close
            </Button>
          </ModalFooter>
        </Modal>
      </div>

      {/* Ejemplo de Modal Grande */}
      <div>
        <Button onClick={() => setLargeModalOpen(true)} className="bg-primary text-white">
          Open Large Modal
        </Button>
        <Modal
          isOpen={isLargeModalOpen}
          onClose={() => setLargeModalOpen(false)}
          title="Large Modal"
          size="lg"
        >
          <p>This is a large modal example with more content to demonstrate scrolling.</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor. Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa. Fusce ac turpis quis ligula lacinia aliquet. Mauris ipsum. Nulla metus metus, ullamcorper vel, tincidunt sed, euismod in, nibh.</p>
          <ModalFooter>
            <Button
              onClick={() => setLargeModalOpen(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white"
            >
              Close
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  );
}
