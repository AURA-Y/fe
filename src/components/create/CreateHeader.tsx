interface CreateHeaderProps {
  title: string;
  description: string;
}

const CreateHeader = ({ title, description }: CreateHeaderProps) => {
  return (
    <header>
      <h1 className="mb-4 text-3xl font-bold tracking-tight">{title}</h1>
      <p className="text-slate-500 dark:text-slate-400">{description}</p>
    </header>
  );
};

export default CreateHeader;
