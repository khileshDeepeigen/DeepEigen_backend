'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ArrowUp, MessageCircle, ChevronDown, ChevronUp, Send, X } from 'lucide-react';
import '../styles/discussion-forum.css';
import PostModal from './postmodal';
import type { DiscussionPost, Question, ForumSectionInfo, ForumSectionQuestionsResponse } from '../data/discussion';
import { csrfFetch } from "../../../utils/csrfFetch";
import { selectIsAuthenticated } from "../../../redux/slices/auth/index";
import { API_BASE } from "../../../utils/api";
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const forumData = {
  forum: {
    searchPlaceholder: 'Search discussions...',
    filters: [
      { id: 'all', label: 'All Weeks' },
      { id: 'week', label: 'This Week' },
      { id: 'unanswered', label: 'Unanswered' },
    ],
    sortOptions: [
      { id: 'recent', label: 'Most Recent' },
      { id: 'popular', label: 'Most Popular' },
      { id: 'unanswered', label: 'Unanswered' },
    ],
  },
  ui: {
    buttons: {
      writePost: 'Write a Post',
      filter: 'Filter',
      sort: 'Sort',
      viewReplies: 'View {count} replies',
      hideReplies: 'Hide replies',
      sendReply: 'Reply',
    },
    placeholders: {
      reply: 'Write a reply...',
    },
    messages: {
      postAction: 'posted a question',
      noPosts: 'No discussions yet. Be the first to start one!',
    },
  },
};



interface DiscussionForumProps {
  courseId?: number;
  courseUrl?: string;
  sectionUrl?: string;
  sectionId?: number;
}


const mapQuestionToPost = (q: Question): DiscussionPost => ({
  id: q.id,
  author: q.user_name || q.user_email?.split('@')[0] || 'User',
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(q.user_email || q.id.toString())}`,
  title: q.title || 'No title',
  content: q.question || '',
  week: q.week || (q as any).section_name || 'Week',
  date: q.created_date
    ? new Date(q.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  replyCount: q.reply_count || q.replies?.length || 0,
  replies: (q.replies || []).map(r => ({
    id: r.id,
    author: r.user_name || r.user_email?.split('@')[0] || 'User',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(r.user_email || r.id.toString())}`,
    content: r.reply,
    timestamp: r.created_date
      ? new Date(r.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '',
    sub_replies: r.sub_replies?.map(sr => ({
      id: sr.id,
      author: sr.user_name || sr.user_email?.split('@')[0] || 'User',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(sr.user_email || sr.id.toString())}`,
      content: sr.sub_reply,
      timestamp: sr.created_date
        ? new Date(sr.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : ''
    }))
  })),
  isExpanded: false,
});



const DiscussionForum: React.FC<DiscussionForumProps> = ({
  courseId,
  courseUrl,
  sectionUrl: initialSectionUrl
}) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Initialize CSRF token on component mount
  useEffect(() => {
    const initCsrfToken = async () => {
      try {
        console.log('[DiscussionForum] Initializing CSRF token...');
        console.log('[DiscussionForum] CSRF token initialized successfully');
      } catch (error) {
        console.error('[DiscussionForum] Failed to initialize CSRF:', error);
      }
    };

    // Only initialize if user is authenticated
    if (isAuthenticated) {
      initCsrfToken();
    }
  }, [isAuthenticated]);





  const [postmodal, setPostModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeSort, setActiveSort] = useState('recent');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>(initialSectionUrl || '');
  const [sections, setSections] = useState<ForumSectionInfo[]>([]);

  const [posts, setPosts] = useState<DiscussionPost[]>([]);
  const [originalPosts, setOriginalPosts] = useState<DiscussionPost[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContents, setReplyContents] = useState<Record<number, string>>({});
  const [replyingToSub, setReplyingToSub] = useState<{ qid: number; rid: number } | null>(null);
  const [subReplyContents, setSubReplyContents] = useState<Record<string, string>>({});
  const [submittingReply, setSubmittingReply] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  const requireAuth = useCallback(() => {
    if (!isAuthenticated) {
      return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
    }
    return null;
  }, [isAuthenticated]);





  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);





  // Fetch sections
  useEffect(() => {
    if (!courseId || !courseUrl) return;
    const fetchSections = async () => {
      try {
        const response = await csrfFetch(
          `${API_BASE}/courses/${courseId}/${courseUrl}/discussionforum/`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (response.status === 401) {
          window.location.href = `/login?next=/courses/${courseId}/${courseUrl}/discussionforum/`;
          return;
        }
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        const responseData = await response.json();

        if (responseData.success) {
          setSections(responseData.sections);

          if (responseData.sections.length > 0) {
            const matchingSection = responseData.sections.find(
              (s: any) => s.url === initialSectionUrl
            );
            if (matchingSection) {
              setSelectedSection(matchingSection.url);
            } else {
              setSelectedSection(responseData.sections[0].url);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch sections:", error);
      }
    };

    fetchSections();
  }, [courseId, courseUrl]);




  // Fetch questions
  useEffect(() => {
    if (!courseId || !courseUrl || !selectedSection) return;
    const invalidSectionPatterns = ['machinelearning', 'overview', 'discussionforum'];
    if (invalidSectionPatterns.includes(selectedSection.toLowerCase())) {
      console.warn("Invalid section URL:", selectedSection);
      return;
    }

    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError(null);

        const page = 1;
        const limit = 20;

        const response = await csrfFetch(
          `${API_BASE}/courses/${courseId}/${courseUrl}/discussionforum/${selectedSection}/?page=${page}&limit=${limit}`,
          {
            method: "GET",
            credentials: "include",
            headers: { Accept: "application/json" },
          }
        );

        if (response.status === 401) {
          window.location.href = `/login?next=/courses/${courseId}/${courseUrl}/discussionforum/${selectedSection}/`;
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data: ForumSectionQuestionsResponse = await response.json();

        if (data.success) {
          const mapped = data.questions.map(mapQuestionToPost);
          setOriginalPosts(mapped);
          setPosts(mapped);
        } else {
          setPosts([]);
          setOriginalPosts([]);
        }
      } catch (error: any) {
        setError(error.message || "Failed to load questions");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [courseId, courseUrl, selectedSection]);




  const searchQuestions = useCallback(async () => {
    if (!searchQuery.trim()) {
      setPosts(originalPosts);
      return;
    }

    if (!courseId || !courseUrl || !selectedSection) return;

    try {
      setLoading(true);
      setError(null);

      const keyword = encodeURIComponent(searchQuery.trim());

      const response = await csrfFetch(
        `${API_BASE}/courses/${courseId}/${courseUrl}/discussionforum/${selectedSection}/search/?keyword=${keyword}`,
        {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const mapped = data.questions.map(mapQuestionToPost);
        setPosts(mapped);
      }
    } catch (error: any) {
      setError(error.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, courseId, courseUrl, selectedSection, originalPosts]);




  // Handle submit reply
  const handleSubmitReply = async (questionId: number) => {
    const content = replyContents[questionId] || '';
    if (!content.trim() || !courseId || !courseUrl || !selectedSection) return;

    setSubmittingReply(true);

    try {
      const res = await csrfFetch(
        `${API_BASE}/courses/${courseId}/${courseUrl}/discussionforum/${selectedSection}/${questionId}/create_reply/`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify({ reply: content.trim() }),
        }
      );

      // Check for redirect (302) which indicates auth issue or wrong response type
      if (res.type === 'opaqueredirect' || res.redirected) {
        throw new Error('Authentication required or session expired. Please refresh the page.');
      }


      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();


      if (!data.success) {
        throw new Error(data.message || 'Failed to create reply');
      }

      const replyId = data.reply?.id;
      if (!replyId || isNaN(Number(replyId))) {
        throw new Error('Reply was created but ID is invalid. Please refresh the page and try again.');
      }

      const newReply = {
        id: Number(replyId),
        author: 'You',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=User`,
        content: content.trim(),
        timestamp: new Date().toLocaleDateString(),
        sub_replies: []
      };

      const updatedPosts = posts.map(post => {
        if (post.id === questionId) {
          return {
            ...post,
            replies: [...post.replies, newReply],
            replyCount: post.replyCount + 1,
            isExpanded: true,
          };
        }
        return post;
      });

      setPosts(updatedPosts);
      setOriginalPosts(prev => prev.map(post =>
        post.id === questionId
          ? { ...post, replies: [...post.replies, newReply], replyCount: post.replyCount + 1, isExpanded: true }
          : post
      ));

      setReplyContents(prev => ({ ...prev, [questionId]: '' }));
      setReplyingTo(null);
    } catch (e: any) {
      alert(e.message || 'Reply failed');
    } finally {
      setSubmittingReply(false);
    }
  };




  // Handle submit subreply
  const handleSubmitSubReply = async (questionId: number, replyId: number) => {
    const key = `${questionId}-${replyId}`;
    const content = subReplyContents[key] || '';
    if (!content.trim() || !courseId || !courseUrl || !selectedSection) return;

    setSubmittingReply(true);

    try {
      const res = await csrfFetch(
        `${API_BASE}/courses/${courseId}/${courseUrl}/discussionforum/${selectedSection}/${questionId}/${replyId}/create_subreply/`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify({ sub_reply: content.trim() }),
        }
      );

      // Check for redirect (302) which indicates auth issue or wrong response type
      if (res.type === 'opaqueredirect' || res.redirected) {
        throw new Error('Authentication required or session expired. Please refresh the page.');
      }

      if (!res.ok) throw new Error(`Server returned ${res.status}`);

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to create subreply');
      }

      // Ensure we have a valid subreply ID from the server
      const subReplyId = data.subreply?.id;
      if (!subReplyId || isNaN(Number(subReplyId))) {
        throw new Error('Subreply was created but ID is invalid. Please refresh the page and try again.');
      }

      const newSubReply = {
        id: Number(subReplyId),  // Ensure it's a number
        author: 'You',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=User`,
        content: content.trim(),
        timestamp: new Date().toLocaleDateString(),
      };

      // Update posts state to include the new subreply
      const updatedPosts = posts.map(post => {
        if (post.id === questionId) {
          return {
            ...post,
            replies: post.replies.map(reply => {
              if (reply.id === replyId) {
                return {
                  ...reply,
                  sub_replies: [...(reply.sub_replies || []), newSubReply],
                };
              }
              return reply;
            }),
          };
        }
        return post;
      });

      setPosts(updatedPosts);
      setOriginalPosts(prev => prev.map(post =>
        post.id === questionId
          ? {
            ...post,
            replies: post.replies.map(reply =>
              reply.id === replyId
                ? { ...reply, sub_replies: [...(reply.sub_replies || []), newSubReply] }
                : reply
            ),
          }
          : post
      ));

      setSubReplyContents(prev => ({ ...prev, [key]: '' }));
      setReplyingToSub(null);
    } catch (e: any) {
      alert(e.message || 'Sub-reply failed');
    } finally {
      setSubmittingReply(false);
    }
  };





  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchQuestions();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuestions]);



  // Filter and sort posts
  useEffect(() => {
    let filteredPosts = [...originalPosts];

    // Apply filter
    if (activeFilter !== 'all') {
      filteredPosts = filteredPosts.filter(post =>
        post.week.toLowerCase().includes(activeFilter.toLowerCase())
      );
    }




    // Apply sorting
    switch (activeSort) {
      case 'recent':
        filteredPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'popular':
        filteredPosts.sort((a, b) => b.replyCount - a.replyCount);
        break;
      case 'unanswered':
        filteredPosts.sort((a, b) => a.replyCount - b.replyCount);
        break;
    }

    setPosts(filteredPosts);
  }, [activeFilter, activeSort, originalPosts]);




  // UI helpers
  const toggleFilterDropdown = () => {
    setShowFilterDropdown(!showFilterDropdown);
    setShowSortDropdown(false);
  };




  const toggleSortDropdown = () => {
    setShowSortDropdown(!showSortDropdown);
    setShowFilterDropdown(false);
  };



  const handleFilterSelect = (filterId: string) => {
    setActiveFilter(filterId);
    setShowFilterDropdown(false);
  };



  const handleSortSelect = (sortId: string) => {
    setActiveSort(sortId);
    setShowSortDropdown(false);
  };



  const toggleReplies = (postId: number) => {
    setPosts(posts.map(post =>
      post.id === postId ? { ...post, isExpanded: !post.isExpanded } : post
    ));
  };




  const handleWritePost = () => {
    // Check authentication before opening modal
    const authCheck = requireAuth();
    if (authCheck) {
      return;
    }
    setPostModal(true);
  };

  // Get sort label
  const getSortLabel = () => {
    const option = forumData.forum.sortOptions.find(o => o.id === activeSort);
    return option?.label || 'Sort';
  };


  // Section selector JSX
  const renderSectionSelector = () => (
    <div className="section-selector">
      <select
        value={selectedSection}
        onChange={(e) => setSelectedSection(e.target.value)}
        className="section-select  border p-2 px-2 border-gray-300 rounded-md"
      >
        {sections.map(section => (
          <option key={section.url} value={section.url}>
            {section.name} {section.question_count !== undefined && `(${section.question_count})`}
          </option>
        ))}
      </select>
    </div>
  );

  // Render loading state if not authenticated
  const authCheck = requireAuth();
  if (authCheck) {
    return authCheck;
  }

  return (
    <div className="forum-container">


      {/* Forum Header */}
      <div className="forum-header">
        <div className="search-bar-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder={forumData.forum.searchPlaceholder}
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>




        <div className="forum-controls">
          {/* Filter Dropdown */}
          {renderSectionSelector()}


          {/* Sort Dropdown */}
          <div ref={sortRef} className={`sort-dropdown ${showSortDropdown ? 'active' : ''}`}>
            <button className="sort-btn" onClick={toggleSortDropdown}>
              <ArrowUp size={18} />
              <span>{getSortLabel()}</span>
            </button>
            <div className="dropdown-content" style={{ display: showSortDropdown ? 'block' : 'none' }}>
              {forumData.forum.sortOptions.map((option: { id: string; label: string }) => (
                <button
                  key={option.id}
                  className={`sort-option ${activeSort === option.id ? 'active' : ''}`}
                  onClick={() => handleSortSelect(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <button className="write-post-btn" onClick={handleWritePost}>
            {forumData.ui.buttons.writePost}
          </button>


        </div>
      </div>

      {/* Discussions List */}
      <div className="discussions-list">
        {loading ? (
          <div className="loading-message">Loading posts...</div>
        ) : error ? (
          <div className="error-message">
            <p>Failed to load posts: {error}</p>
            <button className="write-post-btn" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="no-posts-message">
            <p>{forumData.ui.messages.noPosts}</p>
            <button className="write-post-btn" onClick={handleWritePost}>
              {forumData.ui.buttons.writePost}
            </button>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="discussion-post">
              <div className="post-header">
                <img
                  src={post.avatar}
                  alt={post.author}
                  className="user-avatar"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
                <div className="post-meta">
                  <div className="author-info">
                    <span className="author-name">{post.author}</span>
                    <span className="post-action">{forumData.ui.messages.postAction}</span>
                  </div>
                  <span className="post-date">{post.date}</span>
                </div>
              </div>

              <div className="post-content">
                <h4 className="post-title">{post.title}</h4>
                <p className="post-description">{post.content}</p>

                {/* Reply count & toggle */}
                {post.replyCount > 0 && (
                  <button
                    className="view-replies-btn"
                    onClick={() => toggleReplies(post.id)}
                  >
                    {post.isExpanded ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                    {post.isExpanded
                      ? forumData.ui.buttons.hideReplies
                      : forumData.ui.buttons.viewReplies.replace('{count}', post.replyCount.toString())
                    }
                  </button>
                )}

                {/* Replies Section */}
                {post.isExpanded && post.replies.length > 0 && (
                  <div className="replies-container">
                    {post.replies.map((reply) => (
                      <div key={reply.id} className="reply-item">
                        <img
                          src={reply.avatar}
                          alt={reply.author}
                          className="reply-avatar"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                        <div className="reply-content">
                          <div className="reply-author">
                            {reply.author}
                            <span className="reply-timestamp">{reply.timestamp}</span>
                          </div>
                          <p className="reply-text">{reply.content}</p>

                          {/* Subreplies */}
                          {reply.sub_replies && reply.sub_replies.length > 0 && (
                            <div className="subreplies-container">
                              {reply.sub_replies.map((subreply) => (
                                <div key={subreply.id} className="subreply-item">
                                  <img
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(subreply.author || 'User')}`}
                                    alt={subreply.author}
                                    className="subreply-avatar"
                                  />
                                  <div className="subreply-content">
                                    <div className="subreply-author">
                                      {subreply.author}
                                      <span className="subreply-timestamp">{subreply.timestamp}</span>
                                    </div>
                                    <p className="subreply-text">{subreply.content}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Subreply button - show when not replying to this reply */}
                          {!(replyingToSub?.rid === reply.id && replyingToSub?.qid === post.id) && (
                            <button
                              className="reply-to-reply-btn"
                              onClick={() => setReplyingToSub({ qid: post.id, rid: reply.id })}
                            >
                              <MessageCircle size={14} />
                              Reply
                            </button>
                          )}

                          {/* Subreply input - show when replying to this reply */}
                          {replyingToSub?.rid === reply.id && replyingToSub?.qid === post.id && (
                            <div className="subreply-input-container">
                              <input
                                type="text"
                                placeholder={forumData.ui.placeholders.reply}
                                className="reply-input"
                                value={subReplyContents[`${post.id}-${reply.id}`] || ''}
                                onChange={(e) => setSubReplyContents(prev => ({ ...prev, [`${post.id}-${reply.id}`]: e.target.value }))}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter' && (subReplyContents[`${post.id}-${reply.id}`] || '').trim()) {
                                    handleSubmitSubReply(post.id, reply.id);
                                  }
                                }}
                                autoFocus
                              />
                              <button
                                className="send-reply-btn"
                                onClick={() => handleSubmitSubReply(post.id, reply.id)}
                                disabled={submittingReply || !(subReplyContents[`${post.id}-${reply.id}`] || '').trim()}
                              >
                                <Send size={16} />
                              </button>
                              <button
                                className="cancel-reply-btn"
                                onClick={() => setReplyingToSub(null)}
                              >
                                <X size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply input - show when user clicks to reply */}
                {replyingTo === post.id && (
                  <div className="reply-input-container">
                    <input
                      type="text"
                      placeholder={forumData.ui.placeholders.reply}
                      className="reply-input"
                      id={`reply-input-${post.id}`}
                      value={replyContents[post.id] || ''}
                      onChange={(e) => {
                        setReplyContents(prev => ({ ...prev, [post.id]: e.target.value }));
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && (replyContents[post.id] || '').trim()) {
                          handleSubmitReply(post.id);
                        }
                      }}
                      autoFocus
                    />
                    <button
                      className="send-reply-btn"
                      onClick={() => handleSubmitReply(post.id)}
                      disabled={submittingReply || !(replyContents[post.id] || '').trim()}
                    >
                      {forumData.ui.buttons.sendReply}
                    </button>
                  </div>
                )}

                {/* Reply button - show when not replying */}
                {replyingTo !== post.id && (
                  <button
                    className="write-post-btn"
                    style={{ marginTop: '16px' }}
                    onClick={() => setReplyingTo(post.id)}
                  >
                    {forumData.ui.buttons.sendReply}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {postmodal && (
        <PostModal
          onClose={() => setPostModal(false)}
          onSubmit={function () { }}
          sections={sections}
          courseId={courseId}
          courseUrl={courseUrl}
          selectedSection={selectedSection}
          onPostCreated={(newQuestion: Question) => {
            const mapped = mapQuestionToPost(newQuestion);
            setOriginalPosts(prev => [mapped, ...prev]);
            setPosts(prev => [mapped, ...prev]);
          }}
        />
      )}
    </div>
  );
};

export default DiscussionForum;
