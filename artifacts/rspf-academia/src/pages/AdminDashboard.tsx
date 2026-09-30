import { useState, useEffect, useMemo } from "react";
import { useClerk } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Plus, Pencil, Trash2, Eye, X, ChevronRight, LogOut, Search, Users, BookOpen, TrendingUp, AlertCircle, UserPlus, GraduationCap, Award, Landmark, LayoutDashboard, CreditCard, Settings, ClipboardList, FileSpreadsheet, Layers, Database, CircleCheckBig, CheckSquare, Copy, FlaskConical, Clock, User, Stethoscope, Check, Bell, Sparkles, ShieldCheck } from "lucide-react";
import { ResearchOpportunity, SPECIALTY_COLORS } from "@/lib/researchData";
import RegistrationModal from "@/components/RegistrationModal";
import BulkEditModal from "@/components/BulkEditModal";
import CoordinatorPortalSettingsPanel from "@/components/CoordinatorPortalSettingsPanel";
import { CoordinatorPortalSettings, DEFAULT_COORDINATOR_PORTAL_SETTINGS } from "@/lib/coordinatorPortalSettings";
import ContentControlPanel from "@/components/ContentControlPanel";
import { DEFAULT_SITE_CONTENT_SETTINGS, OpportunityFieldId, SiteContentSettings } from "@/lib/siteContentSettings";
import Footer from "@/components/Footer";
import { SRMA_LOGO } from "@/components/BrandBackground";
import ResearchImagePicker from "@/components/ResearchImagePicker";
import OpportunityMedia from "@/components/OpportunityMedia";
import SpecialtyFilter, { buildSpecialtyOptions, specialtyMatches } from "@/components/SpecialtyFilter";
import OwnerSecurityPanel from "@/components/OwnerSecurityPanel";
import OwnerDataManagementPanel from "@/components/OwnerDataManagementPanel";
import OpportunityImportModal from "@/components/OpportunityImportModal";

const EMPTY_FORM: Omit<ResearchOpportunity, "id" | "createdAt"> = {
  category: "active",
  specialty: "",
  specialtyAr: "",
  specialtyEn: "",
  specialtyColor: "bg-gray-100 text-gray-700",
  title: "",
  titleAr: "",
  titleEn: "",
  description: "",
  descriptionAr: "",
  descriptionEn: "",
  seatsLeft: 15,
  totalSeats: 15,
  firstAuthorSeats: 1,
  firstAuthorSeatsLeft: 1,
  coAuthorSeats: 14,
  coAuthorSeatsLeft: 14,
  status: "open",
  priceOriginalSar: 1500,
  priceDiscountedSar: 1000,
  journalTarget: "",
  journalIssn: "",
  journalPubmed: "",
  journalScopus: "",
  journalWos: "",
  indexedIn: [],
  benefits: ["", "", ""],
  duration: "",
  supervisor: "",
  researchGroupUrl: "",
};

// ... rest of file unchanged ...

  const savePortalSettings = async () => {
    setPortalSettingsSaving(true);
    setPortalSettingsMessage("");
    try {
      const response = await fetch("/api/coordinator-portal-settings", {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(portalSettings),
      });
      const result = await response.json() as CoordinatorPortalSettings | { error?: string };
      if (!response.ok) {
        setPortalSettingsMessage("error" in result && result.error ? result.error : "تعذر حفظ الإعدادات.");
        return;
      }
      setPortalSettings(result as CoordinatorPortalSettings);
      setPortalSettingsMessage("تم الحفظ بنجاح. تظهر التغييرات مباشرة في بوابة المنسق.");
    } catch {
      setPortalSettingsMessage("تعذر الاتصال بالخادم. حاول مرة أخرى.");
    } finally {
      setPortalSettingsSaving(false);
    }
  };

  const saveContentSettings = async () => {
    setContentSettingsSaving(true);
    setContentSettingsMessage("");
    try {
      const response = await fetch("/api/site-content-settings", {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contentSettings),
      });
      const result = await response.json() as SiteContentSettings | { error?: string };
      if (!response.ok) {
        setContentSettingsMessage("error" in result && result.error ? result.error : "تعذر حفظ إعدادات المحتوى.");
        return;
      }
      setContentSettings(result as SiteContentSettings);
      await queryClient.invalidateQueries({ queryKey: ["site-content-settings"] });
      setContentSettingsMessage("تم الحفظ بنجاح. ستظهر التغييرات في صفحات المنصة عند إعادة فتحها.");
    } catch {
      setContentSettingsMessage("تعذر الاتصال بالخادم. حاول مرة أخرى.");
    } finally {
      setContentSettingsSaving(false);
    }
  };

// ... rest of file unchanged ...
