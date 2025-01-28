import { 
    Form, 
    FormControl, 
    FormField, 
    FormItem, 
    FormMessage 
} from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { FC, useEffect, useState } from 'react';
import { Tag } from 'emblor';
import { Input } from './ui/input';
import { supabase } from '@/utils/supabase/supabaseClient';

// Custom hook for tag management
const FormSchema = z.object({
    topics: z.array(
        z.object({
            id: z.string(),
            text: z.string(),
        })
    ).optional(),
});



const useTagForm = (initialTags: Tag[], onTagsChange: (tags: Tag[]) => void,selectedTag : Tag[],selectedId : string) => {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    });

    const [tags, setTags] = useState<Tag[]>(initialTags);
    const [tagInput, setTagInput] = useState('');
    const [activeTagId, setActiveTagId] = useState<string | null>(null);
    const [activeTagId1, setActiveTagId1] = useState<string | null>(null);
    // const [previousTags, setPreviousTags] = useState(selectedTag);

    const { setValue } = form;

    const handleDeleteTag = async (tagId: string) => {
        // const{data,error} = await supabase.from("content").select("tag").eq("id", selectedId);
        // if (error) {
        //     console.error("Error fetching data:", error);
        // }

        // if (!data) {
        //     console.error("Data not found");
        //     return;
        // }
        // const [{ tag }]: { tag: any[] }[] = data;
        // console.log("updated tag ",tag);
        // const newTags = tag.filter((t: any) => { 
        //     t.id !== tagId
        //     console.log(tagId,t.id);
        //     const newTags = tags.filter(tag => tag.id !== tagId);
        //     console.log("deleted newTags-1 ",newTags);
        // });
        // console.log("deleted newTags ",newTags);
        // setTags(newTags);
        // onTagsChange(newTags);
        // setValue('topics', newTags);
        // const tagList = document.getElementById('tag_list');
        //     if (tagList) {
        //         tagList.style.display = 'none';
        //     }
        // if (activeTagId === tagId) {
        //     setActiveTagId(null);
        // }
        // if (activeTagId1 === tagId) {
        //     setActiveTagId1(null);
        // }

        const newTags = tags.filter(tag => tag.id !== tagId);
        setTags(newTags);
        onTagsChange(newTags);
        setValue('topics', newTags);
        if (activeTagId === tagId) {
            setActiveTagId(null);
        }
    };

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        console.log("selectedTag ",selectedTag);
        if (e.key === 'Enter' && tagInput.trim() !== '') {
            e.preventDefault();
            const newTag: Tag = { id: Date.now().toString(), text: tagInput.trim() };
            const newTags = Array.from(new Set([...tags, newTag,...selectedTag]));
            console.log("newTags ",newTags);
            const tagList = document.getElementById('tag_list');
            if (tagList) {
                tagList.style.display = 'none';
            }
            setTags(newTags);
            onTagsChange(newTags);
            setValue('topics', newTags);
            setTagInput(''); // Clear the input field after adding the tag
        }
    };

    const handleTagClick = (tagId: string) => {
        setActiveTagId(tagId);
        setActiveTagId1(tagId);
    };

    // const fetchTagData = async () => {
    //     const {data,error} = await supabase.from("content").select("*").eq("id", selectedId).single();
    //     if (error) {
    //         console.error("Error fetching data:", error);
    //     }
    
    //     console.log("tag data ",data);
    // }

    return {
        form,
        tags,
        tagInput,
        setTagInput,
        activeTagId,
        activeTagId1,
        handleDeleteTag,
        handleAddTag,
        handleTagClick,
    };
};

// Reusable tag form component
interface TagFormProps {
    initialTags: Tag[];
    onTagsChange: (tags: Tag[]) => void;
    selectedTag:Tag[];
    selectedId?:string;
}


const AddTag: FC<TagFormProps> = ({ initialTags, onTagsChange,selectedTag,selectedId }) => {
    const {
        form,
        tags,
        tagInput,
        setTagInput,
        activeTagId,
        activeTagId1,
        handleDeleteTag,
        handleAddTag,
        handleTagClick,
    } = useTagForm(initialTags, onTagsChange,selectedTag || [],selectedId || "");

    return (
        <div className='w-full'>
            <Form {...form}>
                <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                    <FormField
                        control={form.control}
                        name="topics"
                        render={() => (
                            <FormItem className="flex flex-col items-start space-y-1">
                                <FormControl className="w-full">
                                    <Input
                                        placeholder="Add tag here"
                                        className="w-full"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={handleAddTag}
                                    />
                                </FormControl>
                                { 
                                        <p className="flex flex-wrap mt-3" id='tag_list'>{selectedTag.map((tag,i) => (
                                           <span onClick={() => handleTagClick(tag.id)} key={i} className={`mr-2 mb-2 px-2.5 py-0.5 flex items-center rounded-full cursor-pointer border ${activeTagId1 === tag.id ? 'bg-primary_color text-white' : 'border border-border_gray bg-white text-primary_color'}`}>
                                            {tag.text}
                                            {activeTagId1 === tag.id && (
                                                <button
                                                    type="button"
                                                    className="ml-2 text-white"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteTag(tag.id);
                                                    }}
                                                >
                                                    &times;
                                                </button>
                                            )}
                                            </span>
                                        ))}</p>
                                }
                               
                                <div className="flex flex-wrap mt-3">
                                    {tags.map((tag) => (
                                        <span
                                            key={tag.id}
                                            onClick={() => handleTagClick(tag.id)}
                                            className={`mr-2 mb-2 px-2.5 py-0.5 flex items-center rounded-full cursor-pointer ${activeTagId === tag.id ? 'bg-primary_color text-white' : 'border border-border_gray bg-white text-primary_color'}`}
                                        >
                                            {tag.text}
                                            {activeTagId === tag.id && (
                                                <button
                                                    type="button"
                                                    className="ml-2 text-white"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteTag(tag.id);
                                                    }}
                                                >
                                                    &times;
                                                </button>
                                            )}
                                        </span>
                                    ))}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
        </div>
    );
};

export default AddTag;