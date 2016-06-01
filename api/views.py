# coding: utf-8

# DJANGO IMPORTS
import django_filters
from django.contrib.admin.utils import NestedObjects, get_deleted_objects

# REST IMPORTS
from rest_framework import viewsets, filters, response
from rest_framework.decorators import detail_route

# PROJECT IMPORTS
from django.contrib.auth.models import User
from apps.blog.models import *  # NOQA

# SERIALIZERS
from api.serializers import *  # NOQA


class UserFilter(django_filters.FilterSet):
    username = django_filters.CharFilter(name="username", lookup_type="icontains")
    is_staff = django_filters.BooleanFilter(name="is_staff")
    is_active = django_filters.BooleanFilter(name="is_active")

    class Meta:
        model = User
        fields = ("username", "is_staff", "is_active",)


class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    filter_backends = (filters.DjangoFilterBackend, filters.OrderingFilter,)
    filter_class = UserFilter
    ordering_fields = ('id', 'username', 'is_staff', 'is_active', 'date_joined',)

    def get_queryset(self):
        return User.objects.all()

    # @detail_route(methods=['get'])
    # def related(self, request, *args, **kwargs):
    #     related_objects = []
    #     obj = self.get_object()
    #     # collector = NestedObjects()
    #     # collector.collect([obj])
    #     # print "XXX", collector.nested()
    #     # (deleted_objects, model_count, perms_needed, protected) = get_deleted_objects([obj], opts, request.user, self.admin_site, using)
    #     # print "XXX", get_deleted_objects()
    #     related = [rel.get_accessor_name() for rel in obj._meta.get_all_related_objects()]
    #     for r in related:
    #         objects = getattr(obj, r).all()
    #         for rel_obj in objects:
    #             related_objects.append({
    #                 "class": rel_obj._meta.model_name,
    #                 "verbose_name": rel_obj._meta.verbose_name,
    #                 "verbose_name_plural": rel_obj._meta.verbose_name_plural,
    #                 "obj": "%s" % rel_obj
    #             })
    #     return response.Response(related_objects)


class CategoryFilter(django_filters.FilterSet):
    user = django_filters.NumberFilter(name="user", lookup_type="exact")
    name = django_filters.CharFilter(name="name", lookup_type="icontains")

    class Meta:
        model = Category
        fields = ("user", "name",)


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    filter_backends = (filters.DjangoFilterBackend, filters.OrderingFilter,)
    filter_class = CategoryFilter
    ordering_fields = ('id', 'user', 'name', 'slug', 'position',)

    def get_queryset(self):
        return Category.objects.all()


class TagFilter(django_filters.FilterSet):
    user = django_filters.NumberFilter(name="user", lookup_type="exact")

    class Meta:
        model = Tag
        fields = ("user",)

class TagViewSet(viewsets.ModelViewSet):
    serializer_class = TagSerializer
    filter_backends = (filters.DjangoFilterBackend, filters.OrderingFilter,)
    filter_class = TagFilter
    ordering_fields = ('id', 'user', 'name', 'slug',)

    def get_queryset(self):
        return Tag.objects.all()


class EntryFilter(django_filters.FilterSet):
    date = django_filters.DateFilter(name="date", lookup_type="exact")
    date_lt = django_filters.DateFilter(name="date", lookup_type="lt")
    date_gt = django_filters.DateFilter(name="date", lookup_type="gt")

    class Meta:
        model = Entry
        fields = ("user", "date", "status", "category", "tags",)


class EntryViewSet(viewsets.ModelViewSet):
    serializer_class = EntrySerializer
    filter_backends = (filters.DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter,)
    filter_class = EntryFilter
    search_fields = ('title',)
    ordering_fields = ('id', 'title', 'date', 'category', 'tags',)

    def get_queryset(self):
        return Entry.objects.all()

    @detail_route(methods=['get'])
    def links(self, request, *args, **kwargs):
        entry = self.get_object()
        serializer = EntryLinkSerializer(entry.links.all(), many=True)
        return response.Response(serializer.data)


class EntryLinkFilter(django_filters.FilterSet):
    entry = django_filters.NumberFilter(name="entry", lookup_type="exact")

    class Meta:
        model = EntryLink
        fields = ("entry",)


class EntryLinkViewSet(viewsets.ModelViewSet):
    serializer_class = EntryLinkSerializer
    filter_backends = (filters.DjangoFilterBackend, filters.OrderingFilter,)
    filter_class = EntryLinkFilter
    ordering_fields = ('id', 'entry', 'title', 'position',)

    def get_queryset(self):
        return EntryLink.objects.all()
