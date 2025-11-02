
'use client';
import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { StarRating } from './ui/star-rating';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';

interface ReviewFormProps {
  revieweeId: string;
  revieweeType: 'client' | 'contractor' | 'customer';
  projectId?: string;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  revieweeId,
  revieweeType,
  projectId
}) => {
  const [ratings, setRatings] = useState({
    overall: 0,
    communication: 0,
    timeliness: 0,
    quality: 0,
    professionalism: 0,
    value: 0
  });
  const [reviewContent, setReviewContent] = useState({
    title: '',
    description: '',
    pros: [''],
    cons: [''],
    wouldRecommend: false
  });

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would submit to Firebase
    console.log({
      revieweeId,
      revieweeType,
      projectId,
      ratings,
      reviewContent
    });
    alert("Review submitted! (Check console for data)");
  };

  const handleRatingChange = (category: keyof typeof ratings, value: number) => {
    setRatings(prev => ({...prev, [category]: value}));
  };
  
  const handleProsConsChange = (type: 'pros' | 'cons', index: number, value: string) => {
    const list = [...reviewContent[type]];
    list[index] = value;
    setReviewContent(prev => ({...prev, [type]: list}));
  }

  return (
    <form onSubmit={submitReview} className="space-y-8">
      <div>
        <h4 className="font-semibold mb-4">Ratings</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {Object.keys(ratings).map((cat) => (
                <div key={cat} className="flex items-center justify-between">
                    <Label className="capitalize">{cat}</Label>
                    <StarRating
                        currentRating={ratings[cat as keyof typeof ratings]}
                        onRatingChange={(newRating) => 
                            handleRatingChange(cat as keyof typeof ratings, newRating)
                        }
                    />
                </div>
            ))}
        </div>
      </div>
      
      <Separator />

      <div>
        <h4 className="font-semibold mb-4">Details</h4>
        <div className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="review-title">Review Title</Label>
                <Input id="review-title" placeholder="e.g., Excellent Service & Communication" value={reviewContent.title} onChange={(e) => setReviewContent(p => ({...p, title: e.target.value}))}/>
             </div>
             <div className="space-y-2">
                <Label htmlFor="review-description">Detailed Experience</Label>
                <Textarea id="review-description" placeholder="Describe your experience in more detail..." value={reviewContent.description} onChange={(e) => setReviewContent(p => ({...p, description: e.target.value}))}/>
            </div>
        </div>
      </div>

      <Separator />

      <div className="grid md:grid-cols-2 gap-8">
          <div>
              <h4 className="font-semibold mb-4">Pros</h4>
              <div className="space-y-2">
                {reviewContent.pros.map((pro, index) => (
                    <Input key={index} placeholder="e.g., Very communicative" value={pro} onChange={(e) => handleProsConsChange('pros', index, e.target.value)} />
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setReviewContent(p => ({...p, pros: [...p.pros, '']}))}>Add Pro</Button>
              </div>
          </div>
           <div>
              <h4 className="font-semibold mb-4">Cons</h4>
              <div className="space-y-2">
                {reviewContent.cons.map((con, index) => (
                    <Input key={index} placeholder="e.g., Arrived a bit late" value={con} onChange={(e) => handleProsConsChange('cons', index, e.target.value)} />
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setReviewContent(p => ({...p, cons: [...p.cons, '']}))}>Add Con</Button>
              </div>
          </div>
      </div>
      
      <Separator />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
            <Checkbox id="recommend" checked={reviewContent.wouldRecommend} onCheckedChange={(checked) => setReviewContent(p => ({...p, wouldRecommend: !!checked}))}/>
            <Label htmlFor="recommend">I would recommend this professional to a friend or colleague.</Label>
        </div>
        <Button type="submit" size="lg">Submit Review</Button>
      </div>
    </form>
  );
};
