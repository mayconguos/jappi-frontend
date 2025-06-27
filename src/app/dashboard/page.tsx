import Image from 'next/image';

export default function DashboardPage() {
  return (
    <div className='flex flex-col mt-8 items-center'>
      <Image
        src='/images/404.jpg'
        alt='404 Error'
        className='mb-4 w-[480px] h-[600px]'
        width={0} 
        height={0}
        sizes='auto'
        priority
      />
    </div>
  );
}