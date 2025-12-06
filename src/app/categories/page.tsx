'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Edit2,
  Trash2,
  Folder,
  Tag,
  ChevronDown,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { categoriesAPI, skillsAPI } from '@/services/api';
import { Category, Skill } from '@/types';

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'categories' | 'skills'>('categories');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [deleteItem, setDeleteItem] = useState<{ type: 'category' | 'skill'; item: any } | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    parentId: '',
  });
  const [skillForm, setSkillForm] = useState({
    name: '',
    categoryId: '',
  });

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesAPI.getAll,
  });

  const { data: skillsData, isLoading: skillsLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: () => skillsAPI.getAll(),
  });

  const isLoading = categoriesLoading || skillsLoading;

  const createCategoryMutation = useMutation({
    mutationFn: categoriesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowCategoryModal(false);
      resetCategoryForm();
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => categoriesAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowCategoryModal(false);
      resetCategoryForm();
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: categoriesAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowDeleteModal(false);
      setDeleteItem(null);
    },
  });

  const createSkillMutation = useMutation({
    mutationFn: skillsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      setShowSkillModal(false);
      resetSkillForm();
    },
  });

  const updateSkillMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => skillsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      setShowSkillModal(false);
      resetSkillForm();
    },
  });

  const deleteSkillMutation = useMutation({
    mutationFn: skillsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      setShowDeleteModal(false);
      setDeleteItem(null);
    },
  });

  // Extract data from API response
  const categoriesResponse = (categoriesData as any)?.data;
  const categories: Category[] = Array.isArray(categoriesResponse) ? categoriesResponse : (categoriesResponse?.data || []);
  const skillsResponse = (skillsData as any)?.data;
  const skills: Skill[] = Array.isArray(skillsResponse) ? skillsResponse : (skillsResponse?.data || []);

  const resetCategoryForm = () => {
    setCategoryForm({ name: '', slug: '', description: '', icon: '', parentId: '' });
    setEditingCategory(null);
  };

  const resetSkillForm = () => {
    setSkillForm({ name: '', categoryId: '' });
    setEditingSkill(null);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '',
      parentId: category.parentId || '',
    });
    setShowCategoryModal(true);
  };

  const handleEditSkill = (skill: Skill) => {
    setEditingSkill(skill);
    setSkillForm({
      name: skill.name,
      categoryId: skill.categoryId || '',
    });
    setShowSkillModal(true);
  };

  const handleSaveCategory = () => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data: categoryForm });
    } else {
      createCategoryMutation.mutate(categoryForm);
    }
  };

  const handleSaveSkill = () => {
    if (editingSkill) {
      updateSkillMutation.mutate({ id: editingSkill.id, data: skillForm });
    } else {
      createSkillMutation.mutate(skillForm);
    }
  };

  const handleDelete = () => {
    if (deleteItem) {
      if (deleteItem.type === 'category') {
        deleteCategoryMutation.mutate(deleteItem.item.id);
      } else {
        deleteSkillMutation.mutate(deleteItem.item.id);
      }
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categories & Skills</h1>
            <p className="text-gray-500 mt-1">Manage job categories and skill tags</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'categories'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Folder className="w-4 h-4 inline mr-2" />
              Categories ({categories.length})
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'skills'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Tag className="w-4 h-4 inline mr-2" />
              Skills ({skills.length})
            </button>
          </nav>
        </div>

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={() => {
                  resetCategoryForm();
                  setShowCategoryModal(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {categories.map((category) => (
                    <div key={category.id}>
                      <div className="flex items-center justify-between p-4 hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleCategory(category.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            {category.children && category.children.length > 0 ? (
                              expandedCategories.includes(category.id) ? (
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-500" />
                              )
                            ) : (
                              <div className="w-4 h-4" />
                            )}
                          </button>
                          <span className="text-2xl">{category.icon || '📁'}</span>
                          <div>
                            <p className="font-medium text-gray-900">{category.name}</p>
                            <p className="text-sm text-gray-500">{category.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="secondary">{category.jobCount} jobs</Badge>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditCategory(category)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDeleteItem({ type: 'category', item: category });
                                setShowDeleteModal(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      {/* Subcategories */}
                      {expandedCategories.includes(category.id) &&
                        category.children &&
                        category.children.map((child: any) => (
                          <div
                            key={child.id}
                            className="flex items-center justify-between p-4 pl-16 bg-gray-50 hover:bg-gray-100"
                          >
                            <div className="flex items-center gap-3">
                              <Folder className="w-4 h-4 text-gray-400" />
                              <p className="font-medium text-gray-700">{child.name}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge variant="secondary">{child.jobCount} jobs</Badge>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditCategory(child)}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setDeleteItem({ type: 'category', item: child });
                                    setShowDeleteModal(true);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={() => {
                  resetSkillForm();
                  setShowSkillModal(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Skill
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-3">
                  {skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 group"
                    >
                      <Tag className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-700">{skill.name}</span>
                      <span className="text-sm text-gray-400">({skill.category?.name})</span>
                      <div className="hidden group-hover:flex items-center gap-1 ml-2">
                        <button
                          onClick={() => handleEditSkill(skill)}
                          className="p-1 hover:bg-gray-300 rounded"
                        >
                          <Edit2 className="w-3 h-3 text-gray-500" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteItem({ type: 'skill', item: skill });
                            setShowDeleteModal(true);
                          }}
                          className="p-1 hover:bg-gray-300 rounded"
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Category Modal */}
        <Modal
          isOpen={showCategoryModal}
          onClose={() => {
            setShowCategoryModal(false);
            resetCategoryForm();
          }}
          title={editingCategory ? 'Edit Category' : 'Add Category'}
        >
          <div className="space-y-4">
            <Input
              label="Name"
              value={categoryForm.name}
              onChange={(e) => {
                setCategoryForm({
                  ...categoryForm,
                  name: e.target.value,
                  slug: generateSlug(e.target.value),
                });
              }}
              placeholder="e.g., Web Development"
            />
            <Input
              label="Slug"
              value={categoryForm.slug}
              onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
              placeholder="e.g., web-development"
            />
            <Input
              label="Description"
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              placeholder="Brief description of the category"
            />
            <Input
              label="Icon (Emoji)"
              value={categoryForm.icon}
              onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
              placeholder="e.g., 💻"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parent Category
              </label>
              <select
                value={categoryForm.parentId}
                onChange={(e) => setCategoryForm({ ...categoryForm, parentId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">None (Top Level)</option>
                {categories
                  .filter((c) => c.id !== editingCategory?.id)
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCategoryModal(false);
                  resetCategoryForm();
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveCategory}>
                {editingCategory ? 'Update Category' : 'Create Category'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Skill Modal */}
        <Modal
          isOpen={showSkillModal}
          onClose={() => {
            setShowSkillModal(false);
            resetSkillForm();
          }}
          title={editingSkill ? 'Edit Skill' : 'Add Skill'}
        >
          <div className="space-y-4">
            <Input
              label="Name"
              value={skillForm.name}
              onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
              placeholder="e.g., React"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={skillForm.categoryId}
                onChange={(e) => setSkillForm({ ...skillForm, categoryId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSkillModal(false);
                  resetSkillForm();
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveSkill}>
                {editingSkill ? 'Update Skill' : 'Create Skill'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeleteItem(null);
          }}
          title={`Delete ${deleteItem?.type === 'category' ? 'Category' : 'Skill'}`}
        >
          {deleteItem && (
            <div className="space-y-4">
              <p className="text-gray-700">
                Are you sure you want to delete{' '}
                <span className="font-semibold">{deleteItem.item.name}</span>?
                {deleteItem.type === 'category' && (
                  <span className="block text-sm text-red-600 mt-2">
                    This will also delete all subcategories and may affect associated jobs.
                  </span>
                )}
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteItem(null);
                  }}
                >
                  Cancel
                </Button>
                <Button variant="danger" onClick={handleDelete}>
                  Delete
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
}
