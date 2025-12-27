interface CreateMeetingTitleProps {
  title: string;
  description: string;
}

const CreateMeetingTitle = ({ title, description }: CreateMeetingTitleProps) => {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
};

export default CreateMeetingTitle;
