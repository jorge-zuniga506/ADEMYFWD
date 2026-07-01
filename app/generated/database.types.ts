export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      Category: {
        Row: {
          id: string
          nombre: string
        }
        Insert: {
          id?: string
          nombre: string
        }
        Update: {
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      Course: {
        Row: {
          categoryId: string
          created_at: string | null
          descripcion: string
          duracionHoras: number | null
          esExclusivoFwd: boolean
          estado: Database["public"]["Enums"]["CourseStatus"]
          id: string
          instructorId: string
          precio: number
          titulo: string
          videoUrl: string | null
          liveMeetLink: string | null
          liveMeetFecha: string | null
        }
        Insert: {
          categoryId: string
          created_at?: string | null
          descripcion: string
          duracionHoras?: number | null
          esExclusivoFwd?: boolean
          estado?: Database["public"]["Enums"]["CourseStatus"]
          id?: string
          instructorId: string
          precio?: number
          titulo: string
          videoUrl?: string | null
          liveMeetLink?: string | null
          liveMeetFecha?: string | null
        }
        Update: {
          categoryId?: string
          created_at?: string | null
          descripcion?: string
          duracionHoras?: number | null
          esExclusivoFwd?: boolean
          estado?: Database["public"]["Enums"]["CourseStatus"]
          id?: string
          instructorId?: string
          precio?: number
          titulo?: string
          videoUrl?: string | null
          liveMeetLink?: string | null
          liveMeetFecha?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Course_categoryId_fkey"
            columns: ["categoryId"]
            isOneToOne: false
            referencedRelation: "Category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Course_instructorId_fkey"
            columns: ["instructorId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      CourseReview: {
        Row: {
          comentario: string | null
          courseId: string
          estrellas: number
          id: string
          userId: string
        }
        Insert: {
          comentario?: string | null
          courseId: string
          estrellas: number
          id?: string
          userId: string
        }
        Update: {
          comentario?: string | null
          courseId?: string
          estrellas?: number
          id?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "CourseReview_courseId_fkey"
            columns: ["courseId"]
            isOneToOne: false
            referencedRelation: "Course"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "CourseReview_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Enrollment: {
        Row: {
          courseId: string
          completado: boolean
          fechaCompletado: string | null
          id: string
          progreso: number
          userId: string
          archivado: boolean
          lastLessonId: string | null
        }
        Insert: {
          courseId: string
          completado?: boolean
          fechaCompletado?: string | null
          id?: string
          progreso?: number
          userId: string
          archivado?: boolean
          lastLessonId?: string | null
        }
        Update: {
          courseId?: string
          completado?: boolean
          fechaCompletado?: string | null
          id?: string
          progreso?: number
          userId?: string
          archivado?: boolean
          lastLessonId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Enrollment_courseId_fkey"
            columns: ["courseId"]
            isOneToOne: false
            referencedRelation: "Course"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Enrollment_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      FwdCodeSnippet: {
        Row: {
          codigoTexto: string
          fechaCreacion: string
          id: string
          titulo: string
          userId: string
        }
        Insert: {
          codigoTexto: string
          fechaCreacion?: string
          id?: string
          titulo: string
          userId: string
        }
        Update: {
          codigoTexto?: string
          fechaCreacion?: string
          id?: string
          titulo?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "FwdCodeSnippet_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      PayoutRequest: {
        Row: {
          id: string
          userId: string
          cantidad: number
          metodo: string
          cuenta: string
          estado: string
          fechaSolicitud: string
        }
        Insert: {
          id?: string
          userId: string
          cantidad: number
          metodo: string
          cuenta: string
          estado?: string
          fechaSolicitud?: string
        }
        Update: {
          id?: string
          userId?: string
          cantidad?: number
          metodo?: string
          cuenta?: string
          estado?: string
          fechaSolicitud?: string
        }
        Relationships: [
          {
            foreignKeyName: "PayoutRequest_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          }
        ]
      }
      Transaction: {
        Row: {
          id: string
          userId: string
          courseId: string
          cantidad: number
          fecha: string
        }
        Insert: {
          id?: string
          userId: string
          courseId: string
          cantidad: number
          fecha?: string
        }
        Update: {
          id?: string
          userId?: string
          courseId?: string
          cantidad?: number
          fecha?: string
        }
        Relationships: [
          {
            foreignKeyName: "Transaction_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Transaction_courseId_fkey"
            columns: ["courseId"]
            isOneToOne: false
            referencedRelation: "Course"
            referencedColumns: ["id"]
          }
        ]
      }
      FwdCredential: {
        Row: {
          documentoUrl: string
          estado: Database["public"]["Enums"]["VerificationStatus"]
          fechaSolicitud: string
          id: string
          notasAdmin: string | null
          userId: string
        }
        Insert: {
          documentoUrl: string
          estado?: Database["public"]["Enums"]["VerificationStatus"]
          fechaSolicitud?: string
          id?: string
          notasAdmin?: string | null
          userId: string
        }
        Update: {
          documentoUrl?: string
          estado?: Database["public"]["Enums"]["VerificationStatus"]
          fechaSolicitud?: string
          id?: string
          notasAdmin?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "FwdCredential_userId_fkey"
            columns: ["userId"]
            isOneToOne: true
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      FwdJobPost: {
        Row: {
          descripcion: string
          empresa: string
          estado: Database["public"]["Enums"]["VerificationStatus"]
          fechaCreacion: string
          id: string
          salario: string | null
          tituloPuesto: string
          usuarioId: string | null
        }
        Insert: {
          descripcion: string
          empresa: string
          estado?: Database["public"]["Enums"]["VerificationStatus"]
          fechaCreacion?: string
          id?: string
          salario?: string | null
          tituloPuesto: string
          usuarioId?: string | null
        }
        Update: {
          descripcion?: string
          empresa?: string
          estado?: Database["public"]["Enums"]["VerificationStatus"]
          fechaCreacion?: string
          id?: string
          salario?: string | null
          tituloPuesto?: string
          usuarioId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "FwdJobPost_usuarioId_fkey"
            columns: ["usuarioId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Lesson: {
        Row: {
          esGratis: boolean
          id: string
          orden: number
          sectionId: string
          titulo: string
          videoUrl: string
          recursoUrl: string | null
          recursoNombre: string | null
        }
        Insert: {
          esGratis?: boolean
          id?: string
          orden: number
          sectionId: string
          titulo: string
          videoUrl: string
          recursoUrl?: string | null
          recursoNombre?: string | null
        }
        Update: {
          esGratis?: boolean
          id?: string
          orden?: number
          sectionId?: string
          titulo?: string
          videoUrl?: string
          recursoUrl?: string | null
          recursoNombre?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Lesson_sectionId_fkey"
            columns: ["sectionId"]
            isOneToOne: false
            referencedRelation: "Section"
            referencedColumns: ["id"]
          },
        ]
      }
      Section: {
        Row: {
          courseId: string
          id: string
          orden: number
          titulo: string
        }
        Insert: {
          courseId: string
          id?: string
          orden: number
          titulo: string
        }
        Update: {
          courseId?: string
          id?: string
          orden?: number
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "Section_courseId_fkey"
            columns: ["courseId"]
            isOneToOne: false
            referencedRelation: "Course"
            referencedColumns: ["id"]
          },
        ]
      }
      Question: {
        Row: {
          id: string
          userId: string
          courseId: string
          titulo: string
          contenido: string
          fechaCreacion: string
          resuelta: boolean
          videoSegundo: number | null
        }
        Insert: {
          id?: string
          userId: string
          courseId: string
          titulo: string
          contenido: string
          fechaCreacion?: string
          resuelta?: boolean
          videoSegundo?: number | null
        }
        Update: {
          id?: string
          userId?: string
          courseId?: string
          titulo?: string
          contenido?: string
          fechaCreacion?: string
          resuelta?: boolean
          videoSegundo?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Question_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Question_courseId_fkey"
            columns: ["courseId"]
            isOneToOne: false
            referencedRelation: "Course"
            referencedColumns: ["id"]
          },
        ]
      }
      Respuesta: {
        Row: {
          id: string
          questionId: string
          userId: string
          contenido: string
          fechaCreacion: string
        }
        Insert: {
          id?: string
          questionId: string
          userId: string
          contenido: string
          fechaCreacion?: string
        }
        Update: {
          id?: string
          questionId?: string
          userId?: string
          contenido?: string
          fechaCreacion?: string
        }
        Relationships: [
          {
            foreignKeyName: "Respuesta_questionId_fkey"
            columns: ["questionId"]
            isOneToOne: false
            referencedRelation: "Question"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Respuesta_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      User: {
        Row: {
          bio: string | null
          email: string
          fechaRegistro: string
          fotoUrl: string | null
          id: string
          nombre: string
          passwordHash: string
          redesSociales: Record<string, string> | null
          rol: Database["public"]["Enums"]["Role"]
          onboardingDone: boolean
          username: string | null
          propositoUso: string | null
          comoNosConocio: string | null
          avatarUrl: string | null
        }
        Insert: {
          bio?: string | null
          email: string
          fechaRegistro?: string
          fotoUrl?: string | null
          id?: string
          nombre: string
          passwordHash: string
          redesSociales?: Record<string, string> | null
          rol?: Database["public"]["Enums"]["Role"]
          onboardingDone?: boolean
          username?: string | null
          propositoUso?: string | null
          comoNosConocio?: string | null
          avatarUrl?: string | null
        }
        Update: {
          bio?: string | null
          email?: string
          fechaRegistro?: string
          fotoUrl?: string | null
          id?: string
          nombre?: string
          passwordHash?: string
          redesSociales?: Record<string, string> | null
          rol?: Database["public"]["Enums"]["Role"]
          onboardingDone?: boolean
          username?: string | null
          propositoUso?: string | null
          comoNosConocio?: string | null
          avatarUrl?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      CourseStatus: "BORRADOR" | "EN_REVISION" | "PUBLICADO"
      Role: "ESTUDIANTE" | "INSTRUCTOR" | "GRADUADO_FWD" | "ADMIN"
      VerificationStatus: "PENDIENTE" | "APROBADA" | "RECHAZADA"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      CourseStatus: ["BORRADOR", "EN_REVISION", "PUBLICADO"],
      Role: ["ESTUDIANTE", "INSTRUCTOR", "GRADUADO_FWD", "ADMIN"],
      VerificationStatus: ["PENDIENTE", "APROBADA", "RECHAZADA"],
    },
  },
} as const
