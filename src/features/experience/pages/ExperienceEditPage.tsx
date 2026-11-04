import { useParams } from 'react-router';
import Placeholder from '@/shared/ui/Placeholder';

export default function ExperienceEditPage() {
  const { kind, id } = useParams();
  return (
    <Placeholder
      title={`경험 수정 (${kind} #${id})`}
      owner="윤지"
      figma="유윤지 - 디자인 / 경험 등록 - 수정 폼"
    />
  );
}
